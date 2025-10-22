# VFactory Job Status

A modern, colorful factory job management system with role-based access control. Track projects, manage units, and monitor job status in real-time with a beautiful, intuitive interface.

![VFactory Job Status](https://img.shields.io/badge/VFactory-Job%20Status-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MySQL](https://img.shields.io/badge/Database-MySQL-orange)

## ✨ Features

### 🎨 Beautiful UI
- **Color-coded project cards** based on status (Running 🟡, Completed 🟢, Blocked 🔴)
- **Dynamic gradient backgrounds** that change with project status
- **Smooth animations** and hover effects
- **Responsive design** - optimized for all screen sizes (up to 4 columns on XL screens)
- **Compact, modern layout** with carefully designed typography

### 👥 Role-Based Access Control
- **Admin Users**: Full access to create, edit, delete, and archive projects
- **Viewer Users**: Read-only access to view all project data

### 📊 Project Management
- **Create and manage projects** with descriptions
- **Add units** to projects with start/end dates
- **Real-time status updates** - project status automatically calculated from unit statuses
- **Inline status editing** - update unit statuses directly from the dashboard
- **Archive completed projects** - keep your active projects organized
- **View archived projects** - toggle between active and archived views

### 🚀 Smart Features
- **Dynamic status calculation**: Project status automatically updates based on unit statuses
- **Instant UI updates**: Changes reflect immediately without page refresh
- **Connection monitoring**: Real-time backend connection status
- **Enhanced error handling**: Clear, actionable error messages
- **Auto-retry**: Automatic connection retry on temporary failures

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **TailwindCSS** for styling
- **shadcn/ui** components
- **Axios** for API calls
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **MySQL** database
- **JWT** authentication
- **bcrypt** for password hashing
- **CORS** enabled for cross-origin requests

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Quick Start

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd vfactory-job-status
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

3. **Set up the database**
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE project_management;
exit;

# Import schema
mysql -u root project_management < backend/schema.sql
```

4. **Start the application**

**Terminal 1 - Backend:**
```bash
npm run backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

5. **Open the application**
```
http://localhost:8080
```

## 👤 User Accounts

### Admin User (Full Access)
- **Username:** `admin`
- **Password:** `admin123`
- **Permissions:** Create, edit, delete, archive projects and units

### Viewer User (Read-Only)
- **Username:** `viewer`
- **Password:** `viewer123`
- **Permissions:** View all projects and units (no editing)

## 🎯 Usage

### For Admins

1. **Create a Project**
   - Click "Add New Project" button
   - Enter project name and description
   - Project is automatically created with "Not Started" status

2. **Add Units to Project**
   - Click on a project card to view details
   - Click "Add Unit" button
   - Enter unit name, start date, and end date

3. **Update Unit Status**
   - From Dashboard: Use the dropdown on each unit
   - From Project Detail: Edit unit to update status
   - Project status automatically updates based on unit statuses

4. **Archive Projects**
   - When all units are completed, project status becomes "Completed"
   - Click "Archive Project" button to archive
   - Toggle "Show Archived" to view archived projects
   - Click "Restore" to unarchive a project

### For Viewers

- **View all projects** and their current status
- **See unit progress** for each project
- **Toggle between active and archived** projects
- **Click project cards** to view detailed information
- No edit controls are shown

## 📊 Project Status Logic

Project status is automatically calculated based on unit statuses:

- **🟡 Running**: If ANY unit is "In Progress"
- **🟢 Completed**: If ALL units are "Completed"
- **🔴 Blocked**: If ANY unit is "Blocked" (and none in progress)
- **⚪ Not Started**: If all units are "Not Started"

## 🎨 Color Themes

Each project status has a unique color theme:

- **Running**: Yellow to Orange gradient
- **Completed**: Green to Emerald gradient
- **Blocked**: Red to Pink gradient
- **Not Started**: Blue to Purple gradient

## 🔧 Configuration

### Backend Configuration
Edit `backend/server.js`:
```javascript
const PORT = process.env.PORT || 5001;
const JWT_SECRET = 'your-secret-key-change-in-production'; // Change this!

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // Add your MySQL password
    database: 'project_management',
};
```

### Frontend Configuration
Edit `src/api.ts`:
```typescript
const API = axios.create({
  baseURL: 'http://localhost:5001/api', // Change if backend port differs
});
```

## 📁 Project Structure

```
vfactory-job-status/
├── backend/
│   ├── server.js           # Main backend server
│   ├── schema.sql          # Database schema
│   ├── package.json        # Backend dependencies
│   └── migrations/         # Database migrations
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx   # Main dashboard with project cards
│   │   ├── ProjectDetail.tsx # Individual project view
│   │   └── Login.tsx       # Authentication page
│   ├── components/
│   │   └── ui/             # shadcn/ui components
│   ├── api.ts              # Axios API client
│   └── App.tsx             # Main app component
├── public/
├── package.json            # Frontend dependencies
└── README.md               # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/login` - User login

### Projects
- `GET /api/projects` - Get all projects (with `?archived=true/false`)
- `POST /api/projects` - Create new project (admin only)
- `PUT /api/projects/:id/archive` - Archive/unarchive project (admin only)

### Units
- `POST /api/projects/:projectId/units` - Add unit to project (admin only)
- `PATCH /api/units/:unitId/status` - Update unit status (admin only)
- `PUT /api/units/:unitId` - Update unit details (admin only)
- `DELETE /api/units/:unitId` - Delete unit (admin only)

## 🐛 Troubleshooting

### Backend won't start
- Check if MySQL is running: `mysql --version`
- Verify database exists: `SHOW DATABASES;`
- Check port 5001 is available: `lsof -i :5001`

### Frontend shows network error
- Ensure backend is running on port 5001
- Clear browser cache (Cmd+Shift+R)
- Check browser console for detailed error messages

### Database connection failed
- Verify MySQL credentials in `backend/server.js`
- Ensure `project_management` database exists
- Check MySQL is running: `brew services list` (Mac) or `systemctl status mysql` (Linux)

## 🚀 Deployment

### Frontend
```bash
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Backend
1. Update JWT_SECRET to a secure random string
2. Configure production database credentials
3. Set up environment variables
4. Deploy to your Node.js hosting service

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 👨‍💻 Author

VFactory Job Status - Factory Job Management System

---

**Note**: Remember to change the JWT secret and database credentials before deploying to production!
