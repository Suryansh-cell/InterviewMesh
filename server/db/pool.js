const { Pool } = require('pg');
const dns = require('dns');

// Override DNS lookup for neon.tech to use Google DNS and bypass Indian ISP blocking
dns.setServers(['8.8.8.8', '1.1.1.1']);
const defaultLookup = dns.lookup;
dns.lookup = function(domain, options, callback) {
  if (typeof options === 'function') { callback = options; options = {}; }
  if (domain && domain.includes('neon.tech')) {
    dns.resolve4(domain, (err, addresses) => {
      if (!err && addresses && addresses.length > 0) {
        const res = options.all ? addresses.map(a => ({address: a, family: 4})) : addresses[0];
        const fam = options.all ? undefined : 4;
        callback(null, res, fam);
      } else { defaultLookup(domain, options, callback); }
    });
  } else { defaultLookup(domain, options, callback); }
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('✅ Connected to Neon PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
});

module.exports = pool;
