-- VC Project Flow Database Migration
-- Initial Schema Setup

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Assignees table
CREATE TABLE IF NOT EXISTS assignees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stages table
CREATE TABLE IF NOT EXISTS stages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    project_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('pending', 'in-progress', 'completed', 'overdue') DEFAULT 'pending',
    assigned_to INT NULL,
    stage_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES assignees(id) ON DELETE SET NULL
);

-- Insert sample assignees
INSERT INTO assignees (id, name) VALUES 
(1, 'John Doe'),
(2, 'Jane Smith'),
(3, 'Mike Johnson'),
(4, 'Sarah Wilson'),
(5, 'Alex Chen'),
(6, 'Emily Davis'),
(7, 'David Brown'),
(8, 'Lisa Garcia'),
(9, 'Tom Wilson'),
(10, 'Maria Rodriguez')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert sample projects
INSERT INTO projects (id, name, start_date) VALUES 
(1, 'Website Redesign', '2024-01-15'),
(2, 'Mobile App Development', '2024-02-01'),
(3, 'Marketing Campaign Launch', '2024-03-01')
ON DUPLICATE KEY UPDATE name = VALUES(name), start_date = VALUES(start_date);

-- Insert default stages for each initial project (IDs 1-24)
INSERT INTO stages (id, name, project_id) VALUES
(1, 'Stage 1 Initiation', 1),
(2, 'Stage 2 Preparation', 1),
(3, 'Stage 3 Vendor Works', 1),
(4, 'Stage 4 Final Order', 1),
(5, 'Stage 5 Cutlist to Factory', 1),
(6, 'Stage 6 Factory Delivery', 1),
(7, 'Stage 7 Execution', 1),
(8, 'Stage 8 Handover', 1),
(9, 'Stage 1 Initiation', 2),
(10, 'Stage 2 Preparation', 2),
(11, 'Stage 3 Vendor Works', 2),
(12, 'Stage 4 Final Order', 2),
(13, 'Stage 5 Cutlist to Factory', 2),
(14, 'Stage 6 Factory Delivery', 2),
(15, 'Stage 7 Execution', 2),
(16, 'Stage 8 Handover', 2),
(17, 'Stage 1 Initiation', 3),
(18, 'Stage 2 Preparation', 3),
(19, 'Stage 3 Vendor Works', 3),
(20, 'Stage 4 Final Order', 3),
(21, 'Stage 5 Cutlist to Factory', 3),
(22, 'Stage 6 Factory Delivery', 3),
(23, 'Stage 7 Execution', 3),
(24, 'Stage 8 Handover', 3)
ON DUPLICATE KEY UPDATE name = VALUES(name), project_id = VALUES(project_id);

-- Create indexes for better performance (if they don't exist)
-- These indexes may already exist from previous migrations 