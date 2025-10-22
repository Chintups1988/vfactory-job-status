const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'vc_project_flow',
  multipleStatements: true
};

async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 Starting database migration...');
    
    // Connect to MySQL
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    console.log('✅ Connected to MySQL');
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`✅ Database '${dbConfig.database}' ready`);
    
    // Use the database
    await connection.execute(`USE ${dbConfig.database}`);
    
    // Run final schema migration
    console.log('📋 Running final schema migration...');
    const fs = require('fs');
    const path = require('path');
    
    const schemaPath = path.join(__dirname, 'migrations', '005_final_schema.sql');
    const seedPath = path.join(__dirname, 'migrations', '006_final_seed_data.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      await connection.execute(schemaSQL);
      console.log('✅ Schema migration completed');
    } else {
      console.log('⚠️  Schema file not found');
    }
    
    if (fs.existsSync(seedPath)) {
      const seedSQL = fs.readFileSync(seedPath, 'utf8');
      await connection.execute(seedSQL);
      console.log('✅ Seed data migration completed');
    } else {
      console.log('⚠️  Seed data file not found');
    }
    
    console.log('🎉 Database migration completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log('- Users table: Authentication and role management');
    console.log('- Assignees table: Task assignment tracking');
    console.log('- Projects table: Project management with archive functionality');
    console.log('- Stages table: Project workflow stages');
    console.log('- Tasks table: Individual task tracking with status and due dates');
    
    console.log('\n🔑 Sample Login Credentials:');
    console.log('- Admin: demo@admin.com / admin123');
    console.log('- Manager: demo@manager.com / admin123');
    console.log('- User: demo@user.com / admin123');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration(); 