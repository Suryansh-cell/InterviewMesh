const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

// Configure the Neon driver to use the 'ws' package for WebSocket support in Node.js
// This allows bypassing Port 5432 blocking by using Port 443 (HTTPS)
neonConfig.webSocketConstructor = ws;

// Clean the connection string to remove parameters that might conflict with the serverless driver
const rawUrl = process.env.DATABASE_URL || '';
const cleanUrl = rawUrl.split('?')[0]; // The serverless driver handles SSL/WS automatically

const pool = new Pool({
  connectionString: cleanUrl,
  connectionTimeoutMillis: 15000, 
  query_timeout: 20000,
  idleTimeoutMillis: 30000,
});

// Test the connection immediately on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ [DATABASE ERROR] Final Bypass Attempt Failed:', err.message);
    if (err.message.includes('password') || err.message.includes('Credentials')) {
      console.error('👉 TIP: Check your DATABASE_URL password in server/.env');
    }
  } else {
    console.log('✅ [DATABASE SUCCESS] WebSocket Bypass Active');
    release();
  }
});

pool.on('connect', () => {
  console.log('✅ Connected to Neon PostgreSQL (Secure)');
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
});

module.exports = pool;
