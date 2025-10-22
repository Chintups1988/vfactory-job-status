const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'task_track_carousel'
};

async function createUsers() {
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database');

    // Hash the default password
    const defaultPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    console.log('✅ Password hashed successfully');

    // Define users to create/update
    const users = [
      {
        name: 'Admin User',
        email: 'admin@vcprojectflow.com',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'Demo User',
        email: 'demo@vcprojectflow.com',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'John Manager',
        email: 'john@vcprojectflow.com',
        password: hashedPassword,
        role: 'manager'
      },
      {
        name: 'Sarah User',
        email: 'sarah@vcprojectflow.com',
        password: hashedPassword,
        role: 'user'
      }
    ];

    // Insert or update users
    for (const user of users) {
      const [result] = await connection.execute(
        `INSERT INTO users (name, email, password, role) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
         name = VALUES(name), 
         password = VALUES(password), 
         role = VALUES(role)`,
        [user.name, user.email, user.password, user.role]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✅ User ${user.email} created/updated successfully`);
      }
    }

    // Verify users were created
    const [rows] = await connection.execute('SELECT id, name, email, role FROM users');
    console.log('\n📋 Current users in database:');
    rows.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
    });

    console.log('\n🎉 User creation completed successfully!');
    console.log('📝 Default password for all users: admin123');

  } catch (error) {
    console.error('❌ Error creating users:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the script
createUsers(); 