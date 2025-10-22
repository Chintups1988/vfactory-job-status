const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = 'your-secret-key-change-in-production';

// Add global error handlers at the very top
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // <-- put your MySQL root password here
  database: 'task_track_carousel'
});

db.on('error', (err) => {
  console.error('MySQL error:', err);
});

// Test connection
db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected!');
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.post('/api/auth/demo-login', async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', ['demo@vcprojectflow.com']);
    const user = rows[0];
    
    if (!user) {
      return res.status(401).json({ message: 'Demo user not found' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ message: 'Demo login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.promise().query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    
    const token = jwt.sign(
      { id: result.insertId, email, role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: { id: result.insertId, name, email, role }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  }
});

// Admin routes
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT id, name, email, role FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Failed to load users:', error);
    res.status(500).json({ message: 'Failed to load users' });
  }
});

app.post('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.promise().query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    
    res.json({ 
      success: true, 
      user: { id: result.insertId, name, email, role } 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      console.error('Failed to create user:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  }
});

app.put('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { name, email, role } = req.body;
  const userId = req.params.id;
  
  try {
    await db.promise().query(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, userId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const userId = req.params.id;
  
  try {
    await db.promise().query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Protected routes - require authentication
app.use('/api/projects', authenticateToken);
app.use('/api/stages', authenticateToken);
app.use('/api/tasks', authenticateToken);
app.use('/api/assignees', authenticateToken);

// Assignee routes
app.get('/api/assignees', (req, res) => {
  db.query('SELECT * FROM assignees', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.get('/api/assignees/:id', (req, res) => {
  db.query('SELECT * FROM assignees WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]);
  });
});

app.post('/api/assignees', (req, res) => {
  const { name } = req.body;
  db.query('INSERT INTO assignees (name) VALUES (?)', [name], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id: result.insertId, name });
  });
});

app.put('/api/assignees/:id', (req, res) => {
  const { name } = req.body;
  db.query('UPDATE assignees SET name = ? WHERE id = ?', [name, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

app.delete('/api/assignees/:id', (req, res) => {
  db.query('DELETE FROM assignees WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

// Project routes
app.get('/api/projects', authenticateToken, (req, res) => {
  const { archived } = req.query;
  let query = 'SELECT * FROM projects';
  let params = [];
  
  if (archived !== undefined) {
    query += ' WHERE archived = ?';
    params.push(archived === 'true' ? 1 : 0);
  } else {
    // Default to showing only non-archived projects
    query += ' WHERE archived = ?';
    params.push(0);
  }
  
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.get('/api/projects/:id', (req, res) => {
  db.query('SELECT * FROM projects WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]);
  });
});

app.post('/api/projects', (req, res) => {
  const { name, start_date } = req.body;
  const date = start_date || new Date().toISOString().substring(0, 10);
  db.query('INSERT INTO projects (name, start_date) VALUES (?, ?)', [name, date], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query('SELECT * FROM projects WHERE id = ?', [result.insertId], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json(rows[0]);
    });
  });
});

app.put('/api/projects/:id', (req, res) => {
  const { name, start_date } = req.body;
  const fields = [];
  const values = [];
  if (name) { fields.push('name = ?'); values.push(name); }
  if (start_date) { fields.push('start_date = ?'); values.push(start_date); }
  
  if (fields.length === 0) {
    return res.json({ success: true });
  }
  
  values.push(req.params.id);
  const query = `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`;
  
  db.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

app.delete('/api/projects/:id', (req, res) => {
  db.query('DELETE FROM projects WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

// Archive project endpoint
app.put('/api/projects/:id/archive', authenticateToken, (req, res) => {
  const { archived } = req.body;
  db.query('UPDATE projects SET archived = ? WHERE id = ?', [archived ? 1 : 0, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

// Stage routes
app.get('/api/projects/:projectId/stages', (req, res) => {
  db.query('SELECT * FROM stages WHERE project_id = ?', [req.params.projectId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.get('/api/stages/:id', (req, res) => {
  db.query('SELECT * FROM stages WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]);
  });
});

app.post('/api/stages', (req, res) => {
  const { name, project_id } = req.body;
  db.query('INSERT INTO stages (name, project_id) VALUES (?, ?)', [name, project_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id: result.insertId, name, project_id });
  });
});

app.put('/api/stages/:id', (req, res) => {
  const { name } = req.body;
  db.query('UPDATE stages SET name = ? WHERE id = ?', [name, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

app.delete('/api/stages/:id', (req, res) => {
  db.query('DELETE FROM stages WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

// Task routes
app.get('/api/tasks', (req, res) => {
  db.query('SELECT * FROM tasks', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.get('/api/stages/:stageId/tasks', (req, res) => {
  db.query('SELECT * FROM tasks WHERE stage_id = ?', [req.params.stageId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.get('/api/tasks/:id', (req, res) => {
  db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]);
  });
});

app.post('/api/stages/:stageId/tasks', (req, res) => {
  const { title, due_date, status, assigned_to } = req.body;
  db.query(
    'INSERT INTO tasks (title, due_date, status, assigned_to, stage_id) VALUES (?, ?, ?, ?, ?)',
    [title, due_date, status, assigned_to || null, req.params.stageId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId, title, due_date, status, assigned_to, stage_id: req.params.stageId });
    }
  );
});

app.put('/api/tasks/:id', (req, res) => {
  const { title, due_date, status, assigned_to } = req.body;
  db.query(
    'UPDATE tasks SET title = ?, due_date = ?, status = ?, assigned_to = ? WHERE id = ?',
    [title, due_date, status, assigned_to || null, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: true });
    }
  );
});

app.delete('/api/tasks/:id', (req, res) => {
  db.query('DELETE FROM tasks WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

// Add health check endpoint
app.get('/health', (req, res) => res.send('OK'));

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
