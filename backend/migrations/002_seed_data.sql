-- VC Project Flow Seed Data
-- Sample data for testing and demonstration

-- Insert additional sample projects
INSERT INTO projects (name, start_date) VALUES 
('E-commerce Platform', '2024-04-01'),
('Customer Portal', '2024-05-01'),
('API Integration', '2024-06-01'),
('Security Audit', '2024-07-01')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert sample tasks for existing projects
INSERT INTO tasks (title, due_date, status, assigned_to, stage_id) VALUES 
-- Website Redesign tasks
('Design homepage mockup', '2024-01-20', 'completed', 1, 1),
('Create wireframes', '2024-01-25', 'completed', 2, 1),
('Set up development environment', '2024-02-01', 'in-progress', 3, 2),
('Implement responsive design', '2024-02-15', 'pending', 4, 2),
('Integrate payment system', '2024-03-01', 'pending', 5, 3),
('Test user authentication', '2024-03-10', 'pending', 6, 4),
('Deploy to staging', '2024-03-20', 'pending', 7, 5),
('Final testing and bug fixes', '2024-03-25', 'pending', 8, 6),
('Production deployment', '2024-04-01', 'pending', 9, 7),
('User training and documentation', '2024-04-05', 'pending', 10, 8),

-- Mobile App Development tasks
('Define app requirements', '2024-02-05', 'completed', 1, 9),
('Create app wireframes', '2024-02-10', 'completed', 2, 9),
('Set up React Native project', '2024-02-15', 'in-progress', 3, 10),
('Implement navigation structure', '2024-02-25', 'pending', 4, 10),
('Build user authentication', '2024-03-05', 'pending', 5, 11),
('Create API endpoints', '2024-03-15', 'pending', 6, 12),
('Implement push notifications', '2024-03-25', 'pending', 7, 13),
('App store submission prep', '2024-04-05', 'pending', 8, 14),
('Beta testing', '2024-04-15', 'pending', 9, 15),
('App store release', '2024-04-25', 'pending', 10, 16),

-- Marketing Campaign Launch tasks
('Define target audience', '2024-03-05', 'completed', 1, 17),
('Create campaign strategy', '2024-03-10', 'completed', 2, 17),
('Design marketing materials', '2024-03-15', 'in-progress', 3, 18),
('Set up social media accounts', '2024-03-20', 'pending', 4, 18),
('Create email templates', '2024-03-25', 'pending', 5, 19),
('Launch social media ads', '2024-04-01', 'pending', 6, 20),
('Monitor campaign performance', '2024-04-10', 'pending', 7, 21),
('Optimize based on analytics', '2024-04-20', 'pending', 8, 22),
('Prepare final report', '2024-04-25', 'pending', 9, 23),
('Campaign wrap-up meeting', '2024-04-30', 'pending', 10, 24)
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    due_date = VALUES(due_date),
    status = VALUES(status),
    assigned_to = VALUES(assigned_to); 