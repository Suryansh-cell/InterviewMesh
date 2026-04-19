const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const neonConfig = require('@neondatabase/serverless').neonConfig;
neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.split('?')[0],
});

async function populate() {
  try {
    console.log('🚀 Seeding demo peers...');
    
    const demoPeers = [
      { name: 'Sarah Chen', email: 'sarah@demo.com', skills: ['React', 'TypeScript', 'System Design'], elo: 1550 },
      { name: 'Alex Rivera', email: 'alex@demo.com', skills: ['Node.js', 'PostgreSQL', 'Docker'], elo: 1420 },
      { name: 'Marcus Thorne', email: 'marcus@demo.com', skills: ['Python', 'Machine Learning', 'API Design'], elo: 1680 }
    ];

    for (const peer of demoPeers) {
      // Upsert
      await pool.query(
        `INSERT INTO users (name, email, password_hash, skill_tags, is_online, elo_score, rating)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO UPDATE SET 
         is_online = true, 
         skill_tags = $4,
         elo_score = $6`,
        [peer.name, peer.email, 'DEMO_PEER', JSON.stringify(peer.skills), true, peer.elo, 4.8]
      );
      console.log(`✅ Seeded: ${peer.name}`);
    }

    console.log('\n🌟 Demo environment ready! You now have 3 live peers to connect with.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

populate();
