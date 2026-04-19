# MockMate AI — Interview Simulation Platform

A backend-heavy, recruiter-friendly interview simulation platform built with **Node.js**, **Express**, **MongoDB**, and **React**.  
Users can practice mock interviews, submit answers, and receive an instant keyword-based score report.

---

## Architecture

```
Controller → Service → Repository → MongoDB
```

**Design Patterns:** Repository · Service Layer · Strategy · Middleware · Factory · Singleton  
**OOP Concepts:** Encapsulation · Abstraction · Inheritance · Polymorphism  
**Tech Stack:** Node.js · Express · Mongoose · JWT · React · Vite · Axios

---

## How to Run

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally on port 27017

### Step 1 — Start MongoDB
```bash
mongod
```
> Or start it from MongoDB Compass / macOS Services.

### Step 2 — Backend Setup
```bash
cd backend
npm install
npm run seed       # Populate sample questions and users
npm run dev        # Start server on http://localhost:5000
```

### Step 3 — Frontend Setup (new terminal)
```bash
cd frontend
npm install
npm run dev        # Start React app on http://localhost:5173
```

### Step 4 — Open Browser
Visit: **http://localhost:5173**

---

## Demo Credentials

| Role  | Email                   | Password  |
|-------|-------------------------|-----------|
| User  | john@example.com        | user123   |
| Admin | admin@mockmate.com      | admin123  |

---

## API Endpoints

### Auth
| Method | Endpoint              | Access  | Description        |
|--------|-----------------------|---------|--------------------|
| POST   | /api/auth/register    | Public  | Register new user  |
| POST   | /api/auth/login       | Public  | Login, get JWT     |
| GET    | /api/auth/me          | Auth    | Get profile        |

### Interviews
| Method | Endpoint                         | Access | Description              |
|--------|----------------------------------|--------|--------------------------|
| POST   | /api/interviews/start            | Auth   | Start interview session  |
| POST   | /api/interviews/:id/answer       | Auth   | Submit an answer         |
| POST   | /api/interviews/:id/submit       | Auth   | Finalize & score         |
| GET    | /api/interviews/history          | Auth   | Interview history        |
| GET    | /api/interviews/:id/report       | Auth   | Get score report         |

### Questions
| Method | Endpoint               | Access | Description      |
|--------|------------------------|--------|------------------|
| GET    | /api/questions         | Auth   | List questions   |
| GET    | /api/questions/:id     | Auth   | Single question  |
| POST   | /api/questions         | Admin  | Create question  |
| PUT    | /api/questions/:id     | Admin  | Update question  |
| DELETE | /api/questions/:id     | Admin  | Delete question  |

### Admin
| Method | Endpoint          | Access | Description    |
|--------|-------------------|--------|----------------|
| GET    | /api/admin/users  | Admin  | List all users |
| GET    | /api/admin/reports| Admin  | Analytics      |

---

## Run Tests
```bash
cd backend
npm test
```

---

## Project Structure
```
MockMate_AI/
├── backend/
│   ├── config/           # DB singleton, env config
│   ├── controllers/      # HTTP handlers
│   ├── middleware/        # Auth, RBAC, validation, error handler
│   ├── models/           # Mongoose schemas
│   ├── repositories/     # Data access layer (Repository Pattern)
│   ├── routes/           # Express routers
│   ├── services/         # Business logic
│   │   └── scoring/      # Strategy Pattern (Strict + Fuzzy matching)
│   ├── tests/            # Jest unit tests
│   ├── utils/            # Logger, Factory, Constants
│   ├── seed.js           # Database seeder
│   └── server.js         # Entry point
└── frontend/
    └── src/
        ├── components/   # Navbar, ProtectedRoute
        ├── hooks/        # useAuth context
        ├── pages/        # Login, Register, Dashboard, Interview, Results, History, Admin
        └── services/     # Axios API calls
```
