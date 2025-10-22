-- VC Project Flow Database Migration
-- Add archive functionality to projects

-- Add archived column to projects table
ALTER TABLE projects ADD COLUMN archived BOOLEAN DEFAULT FALSE;

-- Create index for better performance when filtering archived projects
CREATE INDEX idx_projects_archived ON projects(archived); 