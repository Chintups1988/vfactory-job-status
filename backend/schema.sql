-- Project Management System Database Schema

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'viewer') DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('Not Started', 'Running', 'Completed', 'Blocked') DEFAULT 'Not Started',
    archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Units table (sub-components of projects)
CREATE TABLE IF NOT EXISTS units (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    status ENUM('Not Started', 'In Progress', 'Blocked', 'Completed') DEFAULT 'Not Started',
    comment TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Insert sample users
-- Admin user (password: admin123)
INSERT INTO users (username, password_hash, role) VALUES 
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Viewer user (password: viewer123)
INSERT INTO users (username, password_hash, role) VALUES 
('viewer', '$2b$10$pNb92o0TU8QH0KIVyIgHme/IAALVf6ABCf08wNEGS8PTaPZe0BmOG', 'viewer');

-- Insert sample projects
INSERT INTO projects (name, description) VALUES 
('Flat 21 Artec', 'Modern apartment complex with contemporary design'),
('Office Building A', 'Commercial office space development'),
('Residential Complex B', 'Multi-family housing project');

-- Insert sample units
INSERT INTO units (project_id, name, status, comment, start_date, end_date) VALUES 
(1, 'Bedroom 1', 'In Progress', 'Wall painting in progress', '2024-01-15', '2024-02-15'),
(1, 'Kitchen', 'Not Started', 'Awaiting material delivery', '2024-02-01', '2024-03-01'),
(1, 'Partition', 'Completed', 'All partitions installed', '2024-01-01', '2024-01-10'),
(2, 'Lobby', 'In Progress', 'Flooring installation', '2024-01-20', '2024-02-20'),
(2, 'Conference Room', 'Blocked', 'Pending approval', '2024-02-01', '2024-03-01');
