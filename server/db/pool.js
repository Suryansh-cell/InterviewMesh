const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  // Important: Set timeouts to prevent the app from hanging when the DB is unreachable
  connectionTimeoutMillis: 5000, 
  query_timeout: 10000,
  idleTimeoutMillis: 30000,
});

pool.on('connect', () => {
  console.log('✅ Connected to Neon PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
});

module.exports = pool;
