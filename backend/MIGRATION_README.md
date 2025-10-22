# VC Project Flow - Database Migration Guide

## Overview
This guide explains how to set up the database for the VC Project Flow application using the migration script.

## Prerequisites
- MySQL server installed and running
- Node.js installed
- Access to MySQL with root privileges (or appropriate user permissions)

## Quick Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Database
Edit the `migrate.js` file if needed to match your MySQL configuration:
```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',           // Your MySQL username
  password: '',           // Your MySQL password
  database: 'vc_project_flow'
};
```

### 3. Run Migration
```bash
node migrate.js
```

## What the Migration Does

### Schema Creation
The migration creates the following tables:

1. **users** - User authentication and role management
   - id, name, email, password, role (admin/manager/user)
   - created_at, updated_at timestamps

2. **assignees** - Task assignment tracking
   - id, name
   - created_at, updated_at timestamps

3. **projects** - Project management with archive functionality
   - id, name, start_date, archived (boolean)
   - created_at, updated_at timestamps
   - Index on archived for performance

4. **stages** - Project workflow stages
   - id, name, project_id (foreign key)
   - created_at, updated_at timestamps
   - Cascade delete with projects

5. **tasks** - Individual task tracking
   - id, title, due_date, status, assigned_to, stage_id
   - created_at, updated_at timestamps
   - Foreign keys to assignees and stages
   - Indexes for performance

### Sample Data
The migration inserts comprehensive sample data:

#### Users
- Admin users with full access
- Manager users with edit permissions
- Regular users with view-only access

#### Projects
- Website Redesign (active)
- Mobile App Development (active)
- Marketing Campaign (active)
- Product Launch (active)
- Customer Support System (archived)
- Legacy System Migration (archived)

#### Assignees
- 10 sample team members for task assignment

#### Stages & Tasks
- Multiple stages per project (Planning, Design, Development, Testing, Deployment)
- Sample tasks with various statuses (pending, in-progress, completed)
- Realistic due dates and assignments

## Sample Login Credentials

### Admin Access (Full permissions)
- Email: `demo@admin.com`
- Password: `admin123`

### Manager Access (Edit permissions)
- Email: `demo@manager.com`
- Password: `admin123`

### User Access (View-only)
- Email: `demo@user.com`
- Password: `admin123`

## Troubleshooting

### Common Issues

1. **Connection Error**
   - Verify MySQL is running
   - Check host, username, and password in migrate.js
   - Ensure user has CREATE DATABASE permissions

2. **Permission Denied**
   - Run as MySQL root user or user with appropriate privileges
   - Grant necessary permissions to your MySQL user

3. **Port Already in Use**
   - Check if another MySQL instance is running
   - Verify port 3306 is available

### Reset Database
To completely reset the database:
```sql
DROP DATABASE IF EXISTS vc_project_flow;
CREATE DATABASE vc_project_flow;
```

Then run the migration again:
```bash
node migrate.js
```

## Migration Files

- `005_final_schema.sql` - Complete database schema
- `006_final_seed_data.sql` - Comprehensive sample data
- `migrate.js` - Migration execution script

## Features Included

✅ **User Authentication** - Login/logout with role-based access
✅ **Project Management** - Create, edit, archive projects
✅ **Stage Management** - Add stages to projects
✅ **Task Management** - Create, edit, assign tasks
✅ **Assignee System** - Assign tasks to team members
✅ **Archive Functionality** - Archive/restore projects
✅ **Role-Based Access** - Different permissions per user role
✅ **Date Handling** - Timezone-safe due date management
✅ **Tooltip Support** - Hover tooltips for lengthy content

## Next Steps

After running the migration:

1. Start the backend server:
   ```bash
   node index.js
   ```

2. Start the frontend development server:
   ```bash
   npm run dev
   ```

3. Access the application at `http://localhost:8080`

4. Login with the sample credentials above

## Support

If you encounter issues:
1. Check the console output for error messages
2. Verify MySQL configuration
3. Ensure all dependencies are installed
4. Check file permissions for migration scripts 