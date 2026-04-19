const pool = require('../db/pool');

module.exports = function (io) {
  const integrityNsp = io.of('/integrity');

  integrityNsp.on('connection', (socket) => {
    console.log(`🛡️ Integrity connected: ${socket.id}`);

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
    });

    // Track paste events
    socket.on('paste-event', async ({ roomId, userId, sessionId, pasteLength, content }) => {
      console.log(`⚠️ Paste detected: ${pasteLength} chars by user ${userId}`);

      try {
        await pool.query(
          `INSERT INTO integrity_events (user_id, session_id, event_type, event_data) 
           VALUES ($1, $2, 'paste', $3)`,
          [userId, sessionId, JSON.stringify({ pasteLength, preview: content?.substring(0, 100) })]
        );
      } catch (err) {
        console.error('Integrity log error:', err);
      }

      // Notify room about integrity flag
      const isSuspicious = pasteLength > 50;
      integrityNsp.to(roomId).emit('integrity-update', {
        type: 'paste',
        userId,
        severity: isSuspicious ? 'warning' : 'info',
        message: isSuspicious 
          ? `Large paste detected (${pasteLength} chars)` 
          : `Small paste (${pasteLength} chars)`,
        timestamp: Date.now()
      });
    });

    // Track tab switches
    socket.on('tab-switch', async ({ roomId, userId, sessionId }) => {
      console.log(`⚠️ Tab switch by user ${userId}`);

      try {
        await pool.query(
          `INSERT INTO integrity_events (user_id, session_id, event_type, event_data) 
           VALUES ($1, $2, 'tab_switch', $3)`,
          [userId, sessionId, JSON.stringify({ timestamp: Date.now() })]
        );
      } catch (err) {
        console.error('Integrity log error:', err);
      }

      integrityNsp.to(roomId).emit('integrity-update', {
        type: 'tab_switch',
        userId,
        severity: 'warning',
        message: 'Tab switch detected',
        timestamp: Date.now()
      });
    });

    // Get current integrity score for a user in a session
    socket.on('get-integrity-score', async ({ userId, sessionId }, callback) => {
      try {
        const result = await pool.query(
          `SELECT event_type, COUNT(*) as count FROM integrity_events 
           WHERE user_id = $1 AND session_id = $2 GROUP BY event_type`,
          [userId, sessionId]
        );

        let score = 100;
        for (const row of result.rows) {
          if (row.event_type === 'paste') score -= parseInt(row.count) * 15;
          if (row.event_type === 'tab_switch') score -= parseInt(row.count) * 10;
        }
        score = Math.max(0, score);

        const status = score > 70 ? 'clean' : score > 40 ? 'review' : 'suspicious';
        if (callback) callback({ score, status });
      } catch (err) {
        console.error('Integrity score error:', err);
        if (callback) callback({ score: 100, status: 'clean' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🛡️ Integrity disconnected: ${socket.id}`);
    });
  });
};
