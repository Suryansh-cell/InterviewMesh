const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/authMiddleware');
const crypto = require('crypto');
const router = express.Router();

// Get top 3 matches for current user
router.get('/', auth, async (req, res) => {
  try {
    const { id } = req.user;
    const me = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (me.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = me.rows[0];

    const candidates = await pool.query(
      `SELECT * FROM users WHERE id != $1 AND is_online = true`, [id]
    );

    const scored = candidates.rows.map(candidate => {
      const overlapMins = getOverlapMinutes(user.free_slots, candidate.free_slots);
      const mySkills = Array.isArray(user.skill_tags) ? user.skill_tags : (user.skill_tags ? JSON.parse(user.skill_tags) : []);
      const theirSkills = Array.isArray(candidate.skill_tags) ? candidate.skill_tags : (candidate.skill_tags ? JSON.parse(candidate.skill_tags) : []);

      const skillDiff = theirSkills.filter(s => !mySkills.includes(s)).length;
      const complementary = mySkills.filter(s => !theirSkills.includes(s)).length;
      const overlapScore = Math.min(overlapMins / 120, 1);
      const diffScore = Math.min(skillDiff / 5, 1);
      const complementScore = Math.min(complementary / 5, 1);
      const ratingScore = (candidate.rating || 3) / 5;
      const eloSimilarity = 1 - Math.min(Math.abs((user.elo_score || 1000) - (candidate.elo_score || 1000)) / 500, 1);

      const score = overlapScore * 0.35 + diffScore * 0.25 + complementScore * 0.15 + ratingScore * 0.15 + eloSimilarity * 0.1;

      return {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        elo_score: candidate.elo_score || 1000,
        rating: candidate.rating || 0,
        skill_tags: theirSkills,
        void_skills: Array.isArray(candidate.void_skills) ? candidate.void_skills : (candidate.void_skills ? JSON.parse(candidate.void_skills) : []),
        free_slots: candidate.free_slots,
        matchScore: Math.round(score * 100),
        complementarySkills: theirSkills.filter(s => !mySkills.includes(s)),
        sharedSkills: theirSkills.filter(s => mySkills.includes(s))
      };
    });

    let top3 = scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);

    // If no one online, return top users by rating as "available soon"
    if (top3.length === 0) {
      const fallback = await pool.query(
        `SELECT * FROM users WHERE id != $1 ORDER BY rating DESC LIMIT 3`, [id]
      );
      top3 = fallback.rows.map(u => {
        const skills = Array.isArray(u.skill_tags) ? u.skill_tags : (u.skill_tags ? JSON.parse(u.skill_tags) : []);
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          elo_score: u.elo_score || 1000,
          rating: u.rating || 0,
          skill_tags: skills,
          void_skills: Array.isArray(u.void_skills) ? u.void_skills : (u.void_skills ? JSON.parse(u.void_skills) : []),
          free_slots: u.free_slots,
          matchScore: Math.round(Math.random() * 30 + 50),
          complementarySkills: [],
          sharedSkills: [],
          availableSoon: true
        };
      });
    }

    res.json(top3);
  } catch (err) {
    console.error('Match error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

function getOverlapMinutes(slotsA, slotsB) {
  if (!slotsA || !slotsB) return 30;
  const a = Array.isArray(slotsA) ? slotsA : (typeof slotsA === 'string' ? JSON.parse(slotsA) : []);
  const b = Array.isArray(slotsB) ? slotsB : (typeof slotsB === 'string' ? JSON.parse(slotsB) : []);
  let total = 0;
  for (const slotA of a) {
    for (const slotB of b) {
      if (slotA.day !== slotB.day) continue;
      const start = Math.max(toMins(slotA.start), toMins(slotB.start));
      const end = Math.min(toMins(slotA.end), toMins(slotB.end));
      if (end > start) total += end - start;
    }
  }
  return total || 30;
}

function toMins(t) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

// Accept a match and create session room
router.post('/accept', auth, async (req, res) => {
  try {
    const { matchedUserId } = req.body;
    const roomId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO sessions (id, user_a, user_b, status) VALUES ($1, $2, $3, 'pending')`,
      [roomId, req.user.id, matchedUserId]
    );
    res.json({ roomId });
  } catch (err) {
    console.error('Accept match error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
