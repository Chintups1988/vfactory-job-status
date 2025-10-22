const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Database connection
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'project_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

// Initialize database connection
async function initDB() {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Auth check:', {
        url: req.url,
        method: req.method,
        hasAuthHeader: !!authHeader,
        hasToken: !!token
    });

    if (!token) {
        console.log('No token provided');
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Token verification failed:', err.message);
            return res.sendStatus(403);
        }
        console.log('Token verified for user:', user.username);
        req.user = user;
        next();
    });
};

// Routes

// Health check endpoint (no authentication required)
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ 
            id: user.id, 
            username: user.username, 
            role: user.role || 'viewer' 
        }, JWT_SECRET);
        
        res.json({ 
            token, 
            username: user.username,
            role: user.role || 'viewer'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all projects
app.get('/api/projects', authenticateToken, async (req, res) => {
    try {
        const { archived } = req.query;
        let query = 'SELECT * FROM projects';
        let params = [];
        
        // Filter by archived status if provided
        if (archived !== undefined) {
            const archivedBool = archived === 'true';
            query += ' WHERE archived = ?';
            params.push(archivedBool ? 1 : 0);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const [projects] = await pool.execute(query, params);
        
        // Get units for each project and calculate overall status
        for (let project of projects) {
            const [units] = await pool.execute(
                'SELECT * FROM units WHERE project_id = ? ORDER BY created_at ASC',
                [project.id]
            );
            project.units = units;
            
            // Calculate project status based on units
            if (units.some(unit => unit.status === 'In Progress')) {
                project.status = 'Running';
            } else if (units.every(unit => unit.status === 'Completed')) {
                project.status = 'Completed';
            } else if (units.some(unit => unit.status === 'Blocked')) {
                project.status = 'Blocked';
            } else {
                project.status = 'Not Started';
            }
            
            // Update project status in database if changed
            if (project.status !== projects.find(p => p.id === project.id).status) {
                await pool.execute(
                    'UPDATE projects SET status = ? WHERE id = ?',
                    [project.status, project.id]
                );
            }
        }
        
        res.json(projects);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new project
app.post('/api/projects', authenticateToken, async (req, res) => {
    try {
        console.log('Creating project:', {
            user: req.user,
            body: req.body
        });
        
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Project name is required' });
        }
        
        const [result] = await pool.execute(
            'INSERT INTO projects (name, description) VALUES (?, ?)',
            [name, description || '']
        );
        
        const projectId = result.insertId;
        const [newProject] = await pool.execute(
            'SELECT * FROM projects WHERE id = ?',
            [projectId]
        );
        
        console.log('Project created successfully:', newProject[0]);
        res.status(201).json(newProject[0]);
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Add unit to project
app.post('/api/projects/:projectId/units', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, start_date, end_date } = req.body;
        
        const [result] = await pool.execute(
            'INSERT INTO units (project_id, name, start_date, end_date) VALUES (?, ?, ?, ?)',
            [projectId, name, start_date, end_date]
        );
        
        const unitId = result.insertId;
        const [newUnit] = await pool.execute(
            'SELECT * FROM units WHERE id = ?',
            [unitId]
        );
        
        res.status(201).json(newUnit[0]);
    } catch (error) {
        console.error('Add unit error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update unit status and comment
app.put('/api/units/:unitId', authenticateToken, async (req, res) => {
    try {
        const { unitId } = req.params;
        const { status, comment } = req.body;
        
        // Build dynamic update query based on provided fields
        let updateFields = [];
        let updateValues = [];
        
        if (status !== undefined) {
            updateFields.push('status = ?');
            updateValues.push(status);
        }
        
        if (comment !== undefined) {
            updateFields.push('comment = ?');
            updateValues.push(comment);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        // Add unitId to the end for WHERE clause
        updateValues.push(unitId);
        
        const updateQuery = `UPDATE units SET ${updateFields.join(', ')} WHERE id = ?`;
        
        await pool.execute(updateQuery, updateValues);
        
        const [updatedUnit] = await pool.execute(
            'SELECT * FROM units WHERE id = ?',
            [unitId]
        );
        
        res.json(updatedUnit[0]);
    } catch (error) {
        console.error('Update unit error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update unit status only (for quick status updates from dashboard)
app.patch('/api/units/:unitId/status', authenticateToken, async (req, res) => {
    try {
        const { unitId } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }
        
        await pool.execute(
            'UPDATE units SET status = ? WHERE id = ?',
            [status, unitId]
        );
        
        const [updatedUnit] = await pool.execute(
            'SELECT * FROM units WHERE id = ?',
            [unitId]
        );
        
        res.json(updatedUnit[0]);
    } catch (error) {
        console.error('Update unit status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update unit dates
app.put('/api/units/:unitId/dates', authenticateToken, async (req, res) => {
    try {
        const { unitId } = req.params;
        const { start_date, end_date } = req.body;
        
        await pool.execute(
            'UPDATE units SET start_date = ?, end_date = ? WHERE id = ?',
            [start_date, end_date, unitId]
        );
        
        const [updatedUnit] = await pool.execute(
            'SELECT * FROM units WHERE id = ?',
            [unitId]
        );
        
        res.json(updatedUnit[0]);
    } catch (error) {
        console.error('Update unit dates error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete unit
app.delete('/api/units/:unitId', authenticateToken, async (req, res) => {
    try {
        const { unitId } = req.params;
        await pool.execute('DELETE FROM units WHERE id = ?', [unitId]);
        res.status(204).send();
    } catch (error) {
        console.error('Delete unit error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete project
app.delete('/api/projects/:projectId', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        await pool.execute('DELETE FROM projects WHERE id = ?', [projectId]);
        res.status(204).send();
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Archive/Unarchive project
app.put('/api/projects/:projectId/archive', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { archived } = req.body;
        
        // Update the project's archived status
        await pool.execute(
            'UPDATE projects SET archived = ? WHERE id = ?',
            [archived ? 1 : 0, projectId]
        );
        
        // Get the updated project
        const [updatedProject] = await pool.execute(
            'SELECT * FROM projects WHERE id = ?',
            [projectId]
        );
        
        res.json(updatedProject[0]);
    } catch (error) {
        console.error('Archive project error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

// Error handling
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
