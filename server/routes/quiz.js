const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/authMiddleware');
const axios = require('axios');
const router = express.Router();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// Submit quiz answer and get ML prediction
router.post('/submit', auth, async (req, res) => {
  try {
    const { session_id, topic, score, time_taken, difficulty } = req.body;
    const userId = req.user.id;

    // Estimate expected time based on difficulty
    const expectedTimes = { easy: 120, medium: 180, hard: 300 };
    const expectedTime = expectedTimes[difficulty] || 180;
    const scoreRatio = score / 100;
    const relativeTime = time_taken / expectedTime;

    // Check how many times this topic was attempted
    const attempts = await pool.query(
      `SELECT COUNT(*) as count FROM quiz_results WHERE user_id = $1 AND topic = $2`,
      [userId, topic]
    );
    const attemptCount = parseInt(attempts.rows[0].count) + 1;

    // Get ML prediction
    let mlLabel = 'PROGRESS';
    try {
      const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
        score_ratio: scoreRatio,
        relative_time: relativeTime,
        attempts: attemptCount
      });
      mlLabel = mlResponse.data.label;
    } catch (mlErr) {
      console.warn('ML service unavailable, using fallback logic');
      if (scoreRatio < 0.4) mlLabel = 'STRONG_GAP';
      else if (scoreRatio < 0.6) mlLabel = 'WEAK_GAP';
      else if (attemptCount > 2) mlLabel = 'RETRY';
      else mlLabel = 'PROGRESS';
    }

    // Store quiz result
    const result = await pool.query(
      `INSERT INTO quiz_results (user_id, session_id, topic, score, time_taken, ml_label, difficulty)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, session_id, topic, score, time_taken, mlLabel, difficulty || 'medium']
    );

    // Update roadmap based on ML label
    await updateRoadmap(userId, topic, mlLabel);

    res.json({
      ...result.rows[0],
      ml_label: mlLabel
    });
  } catch (err) {
    console.error('Quiz submit error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update roadmap based on ML prediction
async function updateRoadmap(userId, topic, label) {
  try {
    const existing = await pool.query(
      `SELECT * FROM roadmap_nodes WHERE user_id = $1 AND topic = $2`,
      [userId, topic]
    );

    if (existing.rows.length > 0) {
      let newStatus;
      switch (label) {
        case 'PROGRESS': newStatus = 'completed'; break;
        case 'WEAK_GAP': newStatus = 'active'; break;
        case 'STRONG_GAP': newStatus = 'active'; break;
        case 'RETRY': newStatus = 'active'; break;
        default: newStatus = 'active';
      }
      await pool.query(
        `UPDATE roadmap_nodes SET status = $1 WHERE user_id = $2 AND topic = $3`,
        [newStatus, userId, topic]
      );
    } else {
      const status = label === 'PROGRESS' ? 'completed' : 'active';
      await pool.query(
        `INSERT INTO roadmap_nodes (user_id, topic, status, ml_label) VALUES ($1, $2, $3, $4)`,
        [userId, topic, status, label]
      );
    }
  } catch (err) {
    console.error('Roadmap update error:', err);
  }
}

// Get quiz results for a session
router.get('/session/:sessionId', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM quiz_results WHERE session_id = $1 AND user_id = $2 ORDER BY created_at ASC`,
      [req.params.sessionId, req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get quiz results error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
