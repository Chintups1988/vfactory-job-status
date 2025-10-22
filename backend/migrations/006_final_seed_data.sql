-- VC Project Flow - Final Seed Data
-- This migration inserts comprehensive sample data

-- Insert sample users
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@vcproject.com', '$2b$10$rQZ8K9mN2pL1vX3yU7wE4tH6jK8mN1pL3vX5yU7wE4tH6jK8mN1pL', 'admin'),
('Manager User', 'manager@vcproject.com', '$2b$10$rQZ8K9mN2pL1vX3yU7wE4tH6jK8mN1pL3vX5yU7wE4tH6jK8mN1pL', 'manager'),
('Regular User', 'user@vcproject.com', '$2b$10$rQZ8K9mN2pL1vX3yU7wE4tH6jK8mN1pL3vX5yU7wE4tH6jK8mN1pL', 'user'),
('Demo Admin', 'demo@admin.com', '$2b$10$rQZ8K9mN2pL1vX3yU7wE4tH6jK8mN1pL3vX5yU7wE4tH6jK8mN1pL', 'admin'),
('Demo Manager', 'demo@manager.com', '$2b$10$rQZ8K9mN2pL1vX3yU7wE4tH6jK8mN1pL3vX5yU7wE4tH6jK8mN1pL', 'manager'),
('Demo User', 'demo@user.com', '$2b$10$rQZ8K9mN2pL1vX3yU7wE4tH6jK8mN1pL3vX5yU7wE4tH6jK8mN1pL', 'user');

-- Insert sample assignees
INSERT INTO assignees (name) VALUES
('John Smith'),
('Sarah Johnson'),
('Mike Davis'),
('Emily Wilson'),
('David Brown'),
('Lisa Anderson'),
('Tom Martinez'),
('Rachel Green'),
('Chris Lee'),
('Amanda Taylor');

-- Insert sample projects
INSERT INTO projects (name, start_date, archived) VALUES
('Website Redesign', '2024-01-15', FALSE),
('Mobile App Development', '2024-02-01', FALSE),
('Marketing Campaign', '2024-01-20', FALSE),
('Product Launch', '2024-03-01', FALSE),
('Customer Support System', '2024-02-15', TRUE),
('Legacy System Migration', '2024-01-10', TRUE);

-- Insert sample stages for Website Redesign
INSERT INTO stages (name, project_id) VALUES
('Planning', 1),
('Design', 1),
('Development', 1),
('Testing', 1),
('Deployment', 1);

-- Insert sample stages for Mobile App Development
INSERT INTO stages (name, project_id) VALUES
('Requirements', 2),
('UI/UX Design', 2),
('Frontend Development', 2),
('Backend Development', 2),
('Testing & QA', 2),
('App Store Submission', 2);

-- Insert sample stages for Marketing Campaign
INSERT INTO stages (name, project_id) VALUES
('Strategy', 3),
('Content Creation', 3),
('Social Media', 3),
('Email Marketing', 3),
('Analytics', 3);

-- Insert sample tasks for Website Redesign
INSERT INTO tasks (title, due_date, status, assigned_to, stage_id) VALUES
('Gather requirements from stakeholders', '2024-01-25', 'completed', 1, 1),
('Create wireframes', '2024-02-05', 'completed', 2, 2),
('Design homepage mockup', '2024-02-10', 'in-progress', 2, 2),
('Develop responsive layout', '2024-02-20', 'pending', 3, 3),
('Implement user authentication', '2024-02-25', 'pending', 3, 3),
('Write unit tests', '2024-03-05', 'pending', 4, 4),
('Perform cross-browser testing', '2024-03-10', 'pending', 4, 4),
('Deploy to staging environment', '2024-03-15', 'pending', 5, 5);

-- Insert sample tasks for Mobile App Development
INSERT INTO tasks (title, due_date, status, assigned_to, stage_id) VALUES
('Define app features', '2024-02-10', 'completed', 1, 6),
('Create user personas', '2024-02-15', 'completed', 2, 7),
('Design app icons', '2024-02-20', 'in-progress', 2, 7),
('Build login screen', '2024-03-01', 'pending', 3, 8),
('Implement API integration', '2024-03-10', 'pending', 4, 9),
('Test on iOS devices', '2024-03-20', 'pending', 5, 10),
('Submit to App Store', '2024-03-25', 'pending', 6, 11);

-- Insert sample tasks for Marketing Campaign
INSERT INTO tasks (title, due_date, status, assigned_to, stage_id) VALUES
('Define target audience', '2024-02-01', 'completed', 1, 12),
('Create campaign brief', '2024-02-05', 'completed', 2, 13),
('Design social media graphics', '2024-02-15', 'in-progress', 2, 13),
('Write blog posts', '2024-02-20', 'pending', 3, 13),
('Schedule social media posts', '2024-02-25', 'pending', 4, 14),
('Set up email sequences', '2024-03-01', 'pending', 4, 15),
('Track campaign metrics', '2024-03-10', 'pending', 5, 16); 