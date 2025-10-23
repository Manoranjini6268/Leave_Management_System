# Leave Management System

A comprehensive leave management system built with MERN stack for organizations to manage employee leaves efficiently.

## Features

### Employee Features
- User registration/login with role-based access
- Dashboard with leave balances
- Apply for different types of leave (Casual, Medical, Earned, etc.)
- View leave application status and history
- Cancel pending leave requests
- Download leave statements

### Manager Features
- Approve/reject leave requests from team members
- View team leave calendar
- Manage team members' leave balances
- Generate team leave reports
- Override leave policies

### Admin Features
- Manage organizational leave policies
- Add/manage employees and departments
- Configure leave types and entitlements
- Generate organization-wide reports
- System configuration and settings

## Tech Stack
- **Frontend**: React.js with modern UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or cloud instance)

### Setup

1. Clone the repository
2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   npm run install-client
   ```

4. Configure environment variables:
   - Update `.env` file with your MongoDB URI and JWT secret

5. Run the application:
   ```bash
   npm run dev
   ```

   This will start both backend (port 5000) and frontend (port 3000)

## Default Admin Credentials
After seeding the database, use these credentials:
- Email: admin@company.com
- Password: admin123

## Roles
- **Team Member**: Regular employee
- **Team Leader**: Can manage team members' leaves
- **Team Manager**: Can manage multiple teams
- **General Manager**: Organization-wide management access

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user

### Leaves
- GET /api/leaves - Get user's leaves
- POST /api/leaves - Apply for leave
- PUT /api/leaves/:id - Update leave request
- DELETE /api/leaves/:id - Cancel leave request

### Manager
- GET /api/manager/pending - Get pending leave requests
- PUT /api/manager/approve/:id - Approve leave
- PUT /api/manager/reject/:id - Reject leave
- GET /api/manager/team-calendar - Get team calendar

### Admin
- GET /api/admin/users - Get all users
- POST /api/admin/users - Create user
- PUT /api/admin/users/:id - Update user
- GET /api/admin/policies - Get leave policies
- POST /api/admin/policies - Create leave policy

## License
ISC
