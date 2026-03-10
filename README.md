# Leave Management System

A production-quality HR leave management application built with the MERN stack. Supports four organisational roles, policy-enforced leave requests, team-scoped dashboards, and a professional blue design system.

---

## Features

### Employee
- Register / log in (JWT-secured)
- View leave balances and year-to-date statistics
- Apply for Casual, Medical, Earned or Unpaid leave
  - Enforced against active `LeavePolicy` (max consecutive days, minimum notice)
  - Overlap detection prevents double-booking
- Track all requests with status badges (pending / approved / rejected / cancelled)
- Cancel pending or approved leaves
- View who approved or rejected a request

### Manager / Team Leader
- Unified manager panel — adapts to the logged-in role
- Approve or reject team leave requests (with rejection reason)
- Atomic balance deduction prevents race conditions
- View team leave calendar
- View member balance overview
- Export team-level leave report

### General Manager (Admin)
- Organisation-wide reports
- Full user directory (add, edit, deactivate)
- Department management
- Create and manage leave policies (quota, carry-forward, notice period, max days)
- Annual leave-balance reset

---

## Tech Stack

| Layer       | Technology                      |
|-------------|---------------------------------|
| Frontend    | React 18, React Router 6, Axios |
| Backend     | Node.js 18, Express.js          |
| Database    | MongoDB + Mongoose              |
| Auth        | JWT (30 d expiry), bcryptjs     |
| Notifications | react-toastify               |

---

## Project Structure

```
├── controllers/        # Business logic (auth, leave, manager, admin)
├── middleware/         # JWT auth guard
├── models/             # Mongoose schemas (User, Leave, Department, LeavePolicy)
├── routes/             # Express route definitions
├── client/
│   └── src/
│       ├── components/ # Navbar, LeaveCard, PrivateRoute
│       ├── context/    # AuthContext (user state, hasRole)
│       ├── pages/      # Dashboard, ApplyLeave, LeaveHistory, ManagerDashboard, AdminDashboard, Login, Register
│       └── utils/      # helpers.js (formatDate, statusBadgeClass, leaveTypeLabel)
├── seed.js             # Database seeder with realistic demo data
├── server.js           # Express entry point
└── .env.example        # Environment variable template
```

---

## Quick Start

### Prerequisites
- Node.js ≥ 16
- MongoDB running locally or a connection string (Atlas)

### 1 — Clone and install

```bash
git clone <repo-url>
cd Leave_Management_System
npm install
npm run install-client
```

### 2 — Configure environment

```bash
cp .env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET, CLIENT_URL
```

### 3 — Seed the database

```bash
node seed.js
```

### 4 — Start the application

```bash
npm run dev        # starts backend (port 5000) + frontend (port 3000)
```

---

## Demo Credentials

| Role             | Email                      | Password     |
|------------------|----------------------------|--------------|
| General Manager  | admin@company.com          | admin123     |
| Team Manager     | manager@company.com        | manager123   |
| Team Manager(HR) | hr.manager@company.com     | hr1234       |
| Team Leader      | leader@company.com         | leader123    |
| Team Leader      | prod.leader@company.com    | prod1234     |
| Employee         | employee@company.com       | employee123  |
| Employee         | jane@company.com           | jane123      |

---

## Role Hierarchy

```
General Manager
  └── Team Manager
        └── Team Leader
              └── Team Member
```

Public registration always creates a **Team Member** account. Higher roles must be assigned by a General Manager.

---

## API Reference

### Auth
| Method | Endpoint              | Description              | Auth |
|--------|-----------------------|--------------------------|------|
| POST   | /api/auth/register    | Register (team_member)   | ✗    |
| POST   | /api/auth/login       | Login → JWT token        | ✗    |
| GET    | /api/auth/me          | Current user profile     | ✓    |

### Leaves
| Method | Endpoint                  | Description           | Auth |
|--------|---------------------------|-----------------------|------|
| POST   | /api/leaves               | Apply for leave       | ✓    |
| GET    | /api/leaves               | My leave history      | ✓    |
| GET    | /api/leaves/:id           | Single leave detail   | ✓    |
| PUT    | /api/leaves/:id/cancel    | Cancel a leave        | ✓    |
| GET    | /api/leaves/stats         | My year stats         | ✓    |

### Manager
| Method | Endpoint                      | Description            | Auth          |
|--------|-------------------------------|------------------------|---------------|
| GET    | /api/manager/pending          | Team pending leaves    | Manager+      |
| PUT    | /api/manager/:id/approve      | Approve leave          | Manager+      |
| PUT    | /api/manager/:id/reject       | Reject leave           | Manager+      |
| GET    | /api/manager/calendar         | Team calendar          | Manager+      |
| GET    | /api/manager/members          | Team members           | Manager+      |
| GET    | /api/manager/balances         | Team balances          | Manager+      |
| GET    | /api/manager/report           | Team leave report      | Manager+      |

### Admin
| Method | Endpoint                      | Description             | Auth   |
|--------|-------------------------------|-------------------------|--------|
| GET    | /api/admin/users              | All users               | GM     |
| POST   | /api/admin/users              | Create user             | GM     |
| PUT    | /api/admin/users/:id          | Update user             | GM     |
| DELETE | /api/admin/users/:id          | Deactivate user         | GM     |
| GET    | /api/admin/departments        | All departments         | GM     |
| POST   | /api/admin/departments        | Create department       | GM     |
| GET    | /api/admin/policies           | All leave policies      | GM     |
| POST   | /api/admin/policies           | Create leave policy     | GM     |
| PUT    | /api/admin/policies/:id       | Update leave policy     | GM     |
| GET    | /api/admin/reports            | Org-wide report         | GM     |
| POST   | /api/admin/reset-balances     | Annual balance reset    | GM     |

---

## Security Notes

- **Role enforcement** — public `/register` hard-codes `role: 'team_member'`; roles can only be elevated by a General Manager
- **CORS** — restricted to `CLIENT_URL` origin (set in `.env`)
- **Request size** — body parser capped at 10 kb
- **Race conditions** — leave-balance deduction uses atomic MongoDB `findOneAndUpdate` with a condition
- **Input sanitisation** — policy creation destructures only whitelisted fields
- **JWT** — 30-day expiry; stored in `localStorage` (suitable for internal HR tools)
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
