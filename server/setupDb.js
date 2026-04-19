require('dotenv').config();
const pool = require('./db/pool');

async function setup() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        skill_tags JSONB,
        void_skills JSONB,
        free_slots JSONB,
        is_online BOOLEAN DEFAULT false,
        elo_score INT DEFAULT 1000,
        rating FLOAT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_a INT REFERENCES users(id),
        user_b INT REFERENCES users(id),
        status VARCHAR(50),
        started_at TIMESTAMP,
        ended_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        session_id VARCHAR(255) REFERENCES sessions(id),
        topic VARCHAR(255),
        score INT,
        time_taken INT,
        ml_label VARCHAR(50),
        difficulty INT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS roadmap_nodes (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        topic VARCHAR(255),
        status VARCHAR(50),
        ml_label VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS session_ratings (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) REFERENCES sessions(id),
        rater_id INT REFERENCES users(id),
        rated_id INT REFERENCES users(id),
        rating INT,
        feedback TEXT,
        UNIQUE(session_id, rater_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS integrity_events (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        session_id VARCHAR(255) REFERENCES sessions(id),
        event_type VARCHAR(50),
        event_data JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Tables created successfully');
  } catch (e) {
    console.error('Setup error:', e);
  } finally {
    pool.end();
  }
}

setup();
