# Leave Management System - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** (optional) - [Download](https://git-scm.com/)

## Installation Steps

### 1. Install MongoDB

#### Windows:
1. Download MongoDB Community Server from the official website
2. Run the installer and follow the installation wizard
3. MongoDB will start automatically as a Windows service
4. Default connection: `mongodb://localhost:27017`

#### Alternative: Use MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `.env` file with your connection string

### 2. Install Backend Dependencies

Open a terminal in the project root directory and run:

```bash
npm install
```

This will install all backend dependencies including:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- cors
- dotenv
- moment

### 3. Install Frontend Dependencies

Navigate to the client directory and install dependencies:

```bash
cd client
npm install
cd ..
```

This will install React and all frontend dependencies.

### 4. Configure Environment Variables

The `.env` file is already created. Update it if needed:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/leave-management
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=30d
```

**Important:** Change `JWT_SECRET` to a secure random string in production!

### 5. Seed the Database

Run the seed script to populate the database with demo data:

```bash
node seed.js
```

This will create:
- 4 Departments (Engineering, HR, Sales, Finance)
- 6 Users with different roles
- 4 Leave Policies
- 3 Sample leave requests

### 6. Start the Application

#### Option 1: Run Both Backend and Frontend Together (Recommended)

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend React app on `http://localhost:3000`

#### Option 2: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

### 7. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Demo Credentials

After seeding the database, you can login with these credentials:

### Admin (General Manager)
- **Email:** admin@company.com
- **Password:** admin123
- **Access:** Full system access, manage users, departments, policies

### Manager (Team Manager)
- **Email:** manager@company.com
- **Password:** manager123
- **Access:** Approve/reject team leaves, view team calendar

### Team Leader
- **Email:** leader@company.com
- **Password:** leader123
- **Access:** Manage direct reports' leaves

### Employee (Team Member)
- **Email:** employee@company.com
- **Password:** employee123
- **Access:** Apply for leave, view leave history

## Features Overview

### Employee Features
- ✅ User registration and login
- ✅ Dashboard with leave balances
- ✅ Apply for different types of leave
- ✅ View leave application status and history
- ✅ Cancel pending leave requests
- ✅ Leave statistics

### Manager Features
- ✅ Approve/reject leave requests
- ✅ View team leave calendar
- ✅ View team members and their balances
- ✅ Generate team leave reports
- ✅ Update team member leave balances

### Admin Features
- ✅ Manage organizational leave policies
- ✅ Add/manage employees and departments
- ✅ Configure leave types and entitlements
- ✅ Generate organization-wide reports
- ✅ Reset leave balances (yearly reset)
- ✅ System configuration

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod --version`
- Check if MongoDB service is started
- Verify the connection string in `.env`

### Port Already in Use
- Backend (5000): Change `PORT` in `.env`
- Frontend (3000): React will prompt to use a different port

### Module Not Found Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- For frontend: `cd client && npm install`

### Cannot Login
- Ensure you've run the seed script: `node seed.js`
- Check MongoDB is running and accessible
- Clear browser cache and cookies

## Project Structure

```
leave-management-system/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/    # Reusable components
│       ├── context/       # React Context (Auth)
│       ├── pages/         # Page components
│       └── App.js
├── controllers/           # Route controllers
├── middleware/           # Auth middleware
├── models/              # MongoDB models
├── routes/              # API routes
├── .env                 # Environment variables
├── server.js           # Express server
├── seed.js             # Database seeder
└── package.json        # Dependencies

```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Leaves
- `GET /api/leaves` - Get user's leaves
- `POST /api/leaves` - Apply for leave
- `GET /api/leaves/stats` - Get leave statistics
- `PUT /api/leaves/:id/cancel` - Cancel leave

### Manager
- `GET /api/manager/pending` - Get pending requests
- `PUT /api/manager/approve/:id` - Approve leave
- `PUT /api/manager/reject/:id` - Reject leave
- `GET /api/manager/team-calendar` - Team calendar
- `GET /api/manager/team-members` - Team members
- `GET /api/manager/report` - Team report

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/departments` - Get departments
- `POST /api/admin/departments` - Create department
- `GET /api/admin/policies` - Get policies
- `POST /api/admin/policies` - Create policy
- `GET /api/admin/reports` - Organization reports
- `POST /api/admin/reset-balances` - Reset balances

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Use a secure `JWT_SECRET`
3. Use MongoDB Atlas or hosted MongoDB
4. Deploy to services like Heroku, AWS, or DigitalOcean

### Frontend
1. Build the React app: `cd client && npm run build`
2. Serve the build folder with Express or deploy to Netlify/Vercel

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check MongoDB and Node.js logs

## License

ISC License
