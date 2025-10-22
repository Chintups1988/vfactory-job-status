# 🚀 Quick Start Guide

Get the Project Management System running in minutes!

## Prerequisites
- ✅ Node.js 18+ installed
- ✅ MySQL 8.0+ running
- ✅ Git installed

## 🎯 One-Command Setup

```bash
# Clone and setup everything
git clone <your-repo-url>
cd task-track-carousel
npm run setup
```

This will:
- Install all dependencies
- Setup the database
- Start both backend and frontend servers

## 🔧 Manual Setup (Alternative)

### 1. Install Dependencies
```bash
npm install
cd backend && npm install
```

### 2. Setup Database
```bash
cd backend
node setup.js
```

### 3. Start Backend
```bash
npm start
```

### 4. Start Frontend (new terminal)
```bash
cd ..
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5001

## 👤 Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

## 📱 Features to Try

1. **Create a Project**: Click "Add New Project"
2. **Add Units**: Click on a project, then "Add New Unit"
3. **Update Status**: Edit units to change their status
4. **Mobile View**: Resize browser or use mobile device

## 🆘 Need Help?

- Check the main README.md for detailed documentation
- Ensure MySQL is running: `mysqladmin ping -h localhost -u root`
- Check ports are available: 5001 (backend) and 5173 (frontend)

## 🎉 You're All Set!

The application is now running with sample data. Start managing your projects!
