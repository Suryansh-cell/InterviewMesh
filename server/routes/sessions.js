const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/authMiddleware');
const axios = require('axios');
const router = express.Router();

// Get session by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT s.*, 
        u1.name as user_a_name, u1.email as user_a_email, u1.skill_tags as user_a_skills,
        u2.name as user_b_name, u2.email as user_b_email, u2.skill_tags as user_b_skills
      FROM sessions s
      LEFT JOIN users u1 ON s.user_a = u1.id
      LEFT JOIN users u2 ON s.user_b = u2.id
      WHERE s.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Session not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get session error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start a session
router.patch('/:id/start', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE sessions SET status = 'active', started_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Session not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Start session error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// End a session
router.patch('/:id/end', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE sessions SET status = 'completed', ended_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Session not found' });

    // Calculate ELO changes
    const session = result.rows[0];
    const quizResults = await pool.query(
      `SELECT user_id, AVG(score) as avg_score FROM quiz_results WHERE session_id = $1 GROUP BY user_id`,
      [id]
    );

    for (const qr of quizResults.rows) {
      const eloChange = Math.round((qr.avg_score - 50) / 5);
      await pool.query(
        `UPDATE users SET elo_score = COALESCE(elo_score, 1000) + $1 WHERE id = $2`,
        [eloChange, qr.user_id]
      );
    }

    // Get integrity events for report
    const integrity = await pool.query(
      `SELECT * FROM integrity_events WHERE session_id = $1`,
      [id]
    );

    const quizData = await pool.query(
      `SELECT * FROM quiz_results WHERE session_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    res.json({
      session: result.rows[0],
      quizResults: quizData.rows,
      integrityEvents: integrity.rows,
      eloChanges: quizResults.rows.map(qr => ({
        userId: qr.user_id,
        change: Math.round((qr.avg_score - 50) / 5)
      }))
    });
  } catch (err) {
    console.error('End session error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Rate a session partner
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;
    
    // Get session to find partner
    const session = await pool.query('SELECT * FROM sessions WHERE id = $1', [id]);
    if (session.rows.length === 0) return res.status(404).json({ error: 'Session not found' });

    const s = session.rows[0];
    const raterId = req.user.id;
    const ratedId = s.user_a === raterId ? s.user_b : s.user_a;

    // Insert rating
    await pool.query(
      `INSERT INTO session_ratings (session_id, rater_id, rated_id, rating, feedback) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (session_id, rater_id) DO UPDATE SET rating = $4, feedback = $5`,
      [id, raterId, ratedId, rating, feedback || '']
    );

    // Update user's average rating
    const avgRating = await pool.query(
      `SELECT AVG(rating) as avg_rating FROM session_ratings WHERE rated_id = $1`,
      [ratedId]
    );
    await pool.query(
      `UPDATE users SET rating = $1 WHERE id = $2`,
      [Math.round(avgRating.rows[0].avg_rating * 10) / 10, ratedId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Rate session error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get session report
router.get('/:id/report', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const session = await pool.query(
      `SELECT s.*, 
        u1.name as user_a_name, u1.elo_score as user_a_elo,
        u2.name as user_b_name, u2.elo_score as user_b_elo
      FROM sessions s
      LEFT JOIN users u1 ON s.user_a = u1.id
      LEFT JOIN users u2 ON s.user_b = u2.id
      WHERE s.id = $1`,
      [id]
    );
    if (session.rows.length === 0) return res.status(404).json({ error: 'Session not found' });

    const quizResults = await pool.query(
      `SELECT * FROM quiz_results WHERE session_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    const integrityEvents = await pool.query(
      `SELECT * FROM integrity_events WHERE session_id = $1`,
      [id]
    );

    // Calculate integrity score
    const pasteEvents = integrityEvents.rows.filter(e => e.event_type === 'paste').length;
    const tabEvents = integrityEvents.rows.filter(e => e.event_type === 'tab_switch').length;
    const integrityScore = Math.max(0, 100 - (pasteEvents * 15) - (tabEvents * 10));
    const integrityStatus = integrityScore > 70 ? 'clean' : integrityScore > 40 ? 'review' : 'suspicious';

    res.json({
      session: session.rows[0],
      quizResults: quizResults.rows,
      integrityEvents: integrityEvents.rows,
      integrityScore,
      integrityStatus
    });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
