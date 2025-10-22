# VC Project Flow - Backend Database Setup

This directory contains the database setup for the VC Project Flow application.

## Database Setup

### Prerequisites
- MySQL server running on localhost
- Node.js installed
- MySQL credentials (default: root user with no password)

### Database Configuration
The application uses the following database configuration:
- **Host**: localhost
- **User**: root
- **Password**: (empty)
- **Database**: vc_project_flow

### Running Migrations

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Run migrations**:
   ```bash
   node migrate.js
   ```

This will:
- Create the database if it doesn't exist
- Execute all migration files in order
- Seed the database with initial data

### Migration Files

The migrations are executed in the following order:

1. **003_complete_schema.sql** - Creates all database tables with proper relationships
2. **004_seed_data.sql** - Inserts initial data (users, assignees, projects, stages, tasks)

### Database Schema

#### Tables
- **users** - User accounts with authentication and roles
- **assignees** - People who can be assigned to tasks
- **projects** - Project information with archive functionality
- **stages** - Project stages/columns
- **tasks** - Individual tasks with status and assignments

#### Key Features
- **Archive functionality** - Projects can be archived/restored
- **Role-based access** - Users have admin, manager, or user roles
- **Task status tracking** - Tasks can be pending, in-progress, completed, or overdue
- **Foreign key relationships** - Proper database integrity

### Sample Data

The seeder creates:
- 3 users (admin, manager, demo)
- 5 assignees
- 3 sample projects (2 active, 1 archived)
- Multiple stages and tasks for each project

### Troubleshooting

If you encounter issues:

1. **Database connection error**: Ensure MySQL is running and accessible
2. **Permission error**: Check MySQL user permissions
3. **Migration fails**: Check the error message for specific SQL issues

### Manual Database Creation

If you need to create the database manually:
```sql
CREATE DATABASE vc_project_flow;
```

### Reset Database

To completely reset the database:
```sql
DROP DATABASE IF EXISTS vc_project_flow;
CREATE DATABASE vc_project_flow;
```

Then run the migration script again. 