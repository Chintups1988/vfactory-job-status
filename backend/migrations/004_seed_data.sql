-- VC Project Flow - Seed Data
-- Insert initial data for the application

-- Insert users
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@vcproject.com', '$2b$10$rQZ9vK9mQZ9vK9mQZ9vK9u', 'admin'),
('Manager User', 'manager@vcproject.com', '$2b$10$rQZ9vK9mQZ9vK9mQZ9vK9u', 'manager'),
('Demo User', 'demo@vcproject.com', '$2b$10$rQZ9vK9mQZ9vK9mQZ9vK9u', 'user');

-- Insert assignees
INSERT INTO assignees (name) VALUES
('John Doe'),
('Jane Smith'),
('Mike Johnson'),
('Sarah Wilson'),
('Alex Brown');

-- Insert sample projects
INSERT INTO projects (name, start_date, archived) VALUES
('Website Redesign', '2024-01-15', FALSE),
('Mobile App Development', '2024-02-01', FALSE),
('Marketing Campaign', '2024-01-20', TRUE);

-- Insert stages for Website Redesign
INSERT INTO stages (name, project_id) VALUES
('Planning', 1),
('Design', 1),
('Development', 1),
('Testing', 1),
('Deployment', 1);

-- Insert stages for Mobile App Development
INSERT INTO stages (name, project_id) VALUES
('Requirements', 2),
('UI/UX Design', 2),
('Frontend Development', 2),
('Backend Development', 2),
('Testing & QA', 2);

-- Insert stages for Marketing Campaign
INSERT INTO stages (name, project_id) VALUES
('Strategy', 3),
('Content Creation', 3),
('Distribution', 3),
('Analytics', 3);

-- Insert tasks for Website Redesign
INSERT INTO tasks (title, due_date, status, assigned_to, stage_id) VALUES
('Gather requirements', '2024-01-20', 'completed', 1, 1),
('Create wireframes', '2024-01-25', 'completed', 2, 2),
('Design mockups', '2024-02-01', 'in-progress', 2, 2),
('Frontend development', '2024-02-15', 'pending', 3, 3),
('Backend API', '2024-02-20', 'pending', 4, 3),
('Unit testing', '2024-02-25', 'pending', 5, 4),
('Integration testing', '2024-03-01', 'pending', 5, 4),
('Deploy to staging', '2024-03-05', 'pending', 1, 5),
('Production deployment', '2024-03-10', 'pending', 1, 5);

-- Insert tasks for Mobile App Development
INSERT INTO tasks (title, due_date, status, assigned_to, stage_id) VALUES
('Define user stories', '2024-02-05', 'completed', 1, 6),
('Create user personas', '2024-02-08', 'completed', 2, 6),
('Design app screens', '2024-02-15', 'in-progress', 2, 7),
('Implement UI components', '2024-03-01', 'pending', 3, 8),
('API integration', '2024-03-15', 'pending', 4, 9),
('Unit tests', '2024-03-20', 'pending', 5, 10),
('User acceptance testing', '2024-03-25', 'pending', 1, 10);

-- Insert tasks for Marketing Campaign
INSERT INTO tasks (title, due_date, status, assigned_to, stage_id) VALUES
('Market research', '2024-01-25', 'completed', 1, 11),
('Define target audience', '2024-01-30', 'completed', 2, 11),
('Create content calendar', '2024-02-05', 'in-progress', 2, 12),
('Design graphics', '2024-02-10', 'pending', 3, 12),
('Social media posts', '2024-02-15', 'pending', 4, 13),
('Email campaigns', '2024-02-20', 'pending', 4, 13),
('Performance analysis', '2024-03-01', 'pending', 5, 14); 