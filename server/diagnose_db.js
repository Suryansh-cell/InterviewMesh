const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();

console.log('🔍 Starting Database Diagnostics...');
console.log('📡 Testing DNS resolution for neon.tech...');

const domain = 'ep-billowing-frost-anmn8l0g-pooler.c-6.us-east-1.aws.neon.tech';

dns.resolve4(domain, (err, addresses) => {
  if (err) {
    console.error('❌ DNS Resolve4 Error:', err.message);
  } else {
    console.log('✅ DNS Resolved addresses:', addresses);
  }

  console.log('🗄️ Attempting DB connection...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ DB Query Error:', err.message);
    } else {
      console.log('✅ DB Query Success:', res.rows[0].now);
    }
    pool.end();
    process.exit();
  });
});

setTimeout(() => {
    console.log('⌛ Diagnostics timed out after 10s. Something is hanging.');
    process.exit(1);
}, 10000);
