const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/ai_ctrl';
  
  console.log('🔌 Connecting to database...');
  console.log('   Connection string:', connectionString.replace(/password@/, '****@'));
  
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    const sqlPath = path.join(__dirname, 'init-db.sql');
    console.log('📄 Reading SQL file:', sqlPath);
    
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🔨 Creating database schema...');
    await client.query(sql);
    
    console.log('✅ Database schema created successfully');
    console.log('');
    console.log('📊 Tables created:');
    console.log('   - user_profiles');
    console.log('   - audit_log');
    console.log('   - query_history');
    console.log('   - model_usage');
    console.log('   - investigations');
    console.log('   - memory_entries');
    console.log('   - memory_relationships');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('');
    console.error('Common issues:');
    console.error('  1. PostgreSQL not running (run: npm run docker:up)');
    console.error('  2. Wrong connection string in .env');
    console.error('  3. Database "ai_ctrl" does not exist');
    process.exit(1);
  } finally {
    await client.end();
    console.log('');
    console.log('✅ Database setup complete');
  }
}

setupDatabase();