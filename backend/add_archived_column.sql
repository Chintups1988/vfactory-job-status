-- Add archived column to existing projects table
ALTER TABLE projects ADD COLUMN archived BOOLEAN DEFAULT FALSE;
