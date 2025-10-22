const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function fixPassword() {
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'project_management',
    });

    console.log('Connected to database');

    // Generate correct hash for "admin123"
    const password = 'admin123';
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('Password:', password);
    console.log('New hash:', hash);
    
    // Update the admin user with correct password
    await connection.execute(
      'UPDATE users SET password_hash = ? WHERE username = ?',
      [hash, 'admin']
    );
    
    console.log('Password updated successfully!');
    
    // Verify it works
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      ['admin']
    );
    
    if (rows.length > 0) {
      const isValid = await bcrypt.compare(password, rows[0].password_hash);
      console.log('Password verification:', isValid ? 'SUCCESS' : 'FAILED');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixPassword();


