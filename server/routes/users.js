const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = result.rows[0];
    // Don't expose password hash
    delete user.password_hash;
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile (skills, availability, etc.)
router.patch('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { skill_tags, void_skills, free_slots, name, is_online } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;

    if (skill_tags !== undefined) {
      updates.push(`skill_tags = $${idx++}`);
      values.push(JSON.stringify(skill_tags));
    }
    if (void_skills !== undefined) {
      updates.push(`void_skills = $${idx++}`);
      values.push(JSON.stringify(void_skills));
    }
    if (free_slots !== undefined) {
      updates.push(`free_slots = $${idx++}`);
      values.push(JSON.stringify(free_slots));
    }
    if (name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(name);
    }
    if (is_online !== undefined) {
      updates.push(`is_online = $${idx++}`);
      values.push(is_online);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = result.rows[0];
    delete user.password_hash;
    res.json(user);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user stats
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const sessions = await pool.query(
      `SELECT COUNT(*) as total FROM sessions WHERE (user_a = $1 OR user_b = $1) AND status = 'completed'`,
      [id]
    );

    const quizResults = await pool.query(
      `SELECT AVG(score) as avg_score FROM quiz_results WHERE user_id = $1`,
      [id]
    );

    const integrity = await pool.query(
      `SELECT AVG(
        CASE WHEN event_type = 'paste' THEN 0.6
             WHEN event_type = 'tab_switch' THEN 0.3
             ELSE 0 END
      ) as avg_flags FROM integrity_events WHERE user_id = $1`,
      [id]
    );

    const integrityScore = Math.max(0, Math.round((1 - (integrity.rows[0].avg_flags || 0)) * 100));

    res.json({
      elo_score: user.rows[0].elo_score || 1000,
      sessions_done: parseInt(sessions.rows[0].total) || 0,
      avg_quiz_score: Math.round(quizResults.rows[0].avg_score || 0),
      integrity_score: integrityScore,
      skill_tags: user.rows[0].skill_tags || [],
      void_skills: user.rows[0].void_skills || [],
      rating: user.rows[0].rating || 0
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's roadmap
router.get('/:id/roadmap', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM roadmap_nodes WHERE user_id = $1 ORDER BY created_at ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Roadmap error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's session history
router.get('/:id/sessions', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT s.*, 
        CASE WHEN s.user_a = $1 THEN u2.name ELSE u1.name END as partner_name,
        CASE WHEN s.user_a = $1 THEN u2.email ELSE u1.email END as partner_email
      FROM sessions s
      LEFT JOIN users u1 ON s.user_a = u1.id
      LEFT JOIN users u2 ON s.user_b = u2.id
      WHERE s.user_a = $1 OR s.user_b = $1
      ORDER BY s.created_at DESC
      LIMIT 20`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Sessions history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
