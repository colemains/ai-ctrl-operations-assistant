const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function seedMockData() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/ai_ctrl';
  
  console.log('🌱 Seeding mock data...');
  
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Load mock users
    const usersPath = path.join(__dirname, '../data/mock/users.json');
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    
    console.log(`📥 Loading ${users.length} mock users...`);
    
    for (const user of users) {
      await client.query(
        `INSERT INTO user_profiles (email, name, role, discipline, data_access, preferences)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           discipline = EXCLUDED.discipline,
           data_access = EXCLUDED.data_access,
           preferences = EXCLUDED.preferences,
           updated_at = NOW()`,
        [
          user.email,
          user.name,
          user.role,
          user.discipline,
          JSON.stringify(user.data_access),
          JSON.stringify(user.preferences)
        ]
      );
      console.log(`   ✓ ${user.name} (${user.email})`);
    }
    
    // Insert sample audit logs
    console.log('📥 Creating sample audit logs...');
    
    const sampleLogs = [
      {
        user_email: 'cole.mains@expedient.com',
        action: 'query_tickets',
        resource: 'smc_tickets',
        client_id: 'client-alpha',
        details: { filter: 'priority:critical', result_count: 2 }
      },
      {
        user_email: 'cole.mains@expedient.com',
        action: 'query_alerts',
        resource: 'alerts',
        client_id: 'client-beta',
        details: { filter: 'severity:high', result_count: 1 }
      },
      {
        user_email: 'security.analyst@expedient.com',
        action: 'query_elastic',
        resource: 'elastic_metrics',
        client_id: 'client-gamma',
        details: { metric: 'disk_usage', value: '45%' }
      }
    ];
    
    for (const log of sampleLogs) {
      await client.query(
        `INSERT INTO audit_log (user_email, action, resource, client_id, details, success)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [log.user_email, log.action, log.resource, log.client_id, JSON.stringify(log.details), true]
      );
    }
    
    console.log(`   ✓ Created ${sampleLogs.length} sample audit log entries`);
    
    console.log('');
    console.log('✅ Mock data seeded successfully');
    console.log('');
    console.log('🎯 You can now query with these test users:');
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedMockData();