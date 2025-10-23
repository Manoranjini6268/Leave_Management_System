# Quick Start Guide - Leave Management System

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 2: Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
- MongoDB should start automatically if installed as a service
- Or run: `mongod` in a terminal

**Check if MongoDB is running:**
```bash
mongosh
# or
mongo
```

### Step 3: Seed the Database

```bash
node seed.js
```

You should see:
```
MongoDB Connected
Cleared existing data
Departments created
Users created
...
Database seeded successfully!
```

### Step 4: Start the Application

```bash
npm run dev
```

This starts both backend (port 5000) and frontend (port 3000).

### Step 5: Login

Open browser: `http://localhost:3000`

**Try these accounts:**

| Role | Email | Password | What you can do |
|------|-------|----------|-----------------|
| **Admin** | admin@company.com | admin123 | Everything! Manage users, departments, policies |
| **Manager** | manager@company.com | manager123 | Approve/reject leaves, view team calendar |
| **Team Leader** | leader@company.com | leader123 | Manage team member leaves |
| **Employee** | employee@company.com | employee123 | Apply for leave, view history |

## 📋 What to Try

### As an Employee:
1. **View Dashboard** - See your leave balances
2. **Apply for Leave** - Click "Apply for Leave" button
3. **View History** - Check your leave requests
4. **Cancel Leave** - Cancel pending requests

### As a Manager:
1. **Go to Manager Panel** - Click "Manager Panel" in navbar
2. **Approve/Reject Leaves** - Review pending requests
3. **View Team Calendar** - See who's on leave
4. **Check Team Members** - View team leave balances

### As an Admin:
1. **Go to Admin Panel** - Click "Admin Panel" in navbar
2. **Manage Users** - Add/edit employees
3. **Manage Departments** - Create departments
4. **Configure Policies** - Set leave policies
5. **View Reports** - Organization-wide statistics

## 🎯 Key Features

### ✅ Employee Features
- Dashboard with leave balances
- Apply for Casual, Medical, Earned, or Unpaid leave
- View leave history with filters
- Cancel pending/approved leaves
- Leave statistics

### ✅ Manager Features
- Approve/reject team leave requests
- View team leave calendar
- Team member management
- Generate team reports
- Override leave balances

### ✅ Admin Features
- User management (CRUD operations)
- Department management
- Leave policy configuration
- Organization-wide reports
- Yearly leave balance reset

## 🔧 Common Commands

```bash
# Start both backend and frontend
npm run dev

# Start only backend
npm run server

# Start only frontend
npm run client

# Seed database with demo data
node seed.js

# Build frontend for production
cd client && npm run build
```

## 📱 Application Flow

### Employee Journey:
```
Login → Dashboard → Apply Leave → Wait for Approval → View Status
```

### Manager Journey:
```
Login → Manager Panel → Review Requests → Approve/Reject → View Calendar
```

### Admin Journey:
```
Login → Admin Panel → Manage Users/Departments → Configure Policies → View Reports
```

## 🎨 UI Highlights

- **Modern Design** - Clean, professional interface
- **Responsive** - Works on desktop, tablet, and mobile
- **Role-Based UI** - Different views for different roles
- **Real-time Updates** - Instant feedback on actions
- **Intuitive Navigation** - Easy to find what you need

## 📊 Leave Types

| Type | Default Quota | Description |
|------|---------------|-------------|
| **Casual** | 12 days/year | For personal reasons |
| **Medical** | 12 days/year | For health issues |
| **Earned** | 15 days/year | For planned vacations |
| **Unpaid** | Unlimited | Without pay |

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- Secure session management

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service (Windows)
net start MongoDB
```

### "Port 5000 already in use"
- Change PORT in `.env` file
- Or stop the process using port 5000

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# For frontend
cd client
rm -rf node_modules package-lock.json
npm install
```

### "Cannot login"
- Make sure you ran `node seed.js`
- Check MongoDB is running
- Clear browser cache

## 📚 Next Steps

1. **Explore the Code** - Check out the well-documented code
2. **Customize** - Modify leave types, policies, or UI
3. **Add Features** - Extend with notifications, email alerts, etc.
4. **Deploy** - Host on Heroku, AWS, or your preferred platform

## 💡 Tips

- **Use Chrome DevTools** - Inspect network requests and responses
- **Check Console** - Look for errors in browser console
- **Read Logs** - Backend logs show API requests and errors
- **Test Different Roles** - Login as different users to see all features

## 🎓 Learning Resources

- **React** - [React Documentation](https://react.dev/)
- **Express** - [Express Guide](https://expressjs.com/)
- **MongoDB** - [MongoDB Manual](https://docs.mongodb.com/)
- **JWT** - [JWT.io](https://jwt.io/)

## ✨ Features Checklist

- [x] User Authentication & Authorization
- [x] Role-Based Access Control (4 roles)
- [x] Leave Application System
- [x] Approval Workflow
- [x] Leave Balance Tracking
- [x] Team Calendar View
- [x] Department Management
- [x] Leave Policy Configuration
- [x] Reports & Analytics
- [x] Responsive Design
- [x] Modern UI/UX

## 🚀 Ready to Go!

You now have a fully functional Leave Management System. Start exploring and customizing it to fit your organization's needs!

**Happy Managing! 🎉**
