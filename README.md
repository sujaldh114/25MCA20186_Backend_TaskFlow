# TaskFlow – Task Management System with JWT Authentication

[![Course](https://img.shields.io/badge/Course-MCA%20Semester%203-blue.svg)](#)
[![Subject](https://img.shields.io/badge/Subject-Backend%20Technologies%20Lab-orange.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20Express%20%7C%20MongoDB%20%7C%20React-green.svg)](#)
[![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20Bcrypt.js-red.svg)](#)

A full-stack, production-ready web application built to demonstrate core backend engineering principles including **JSON Web Token (JWT) Authentication**, **Role & Ownership Authorization (IDOR Protection)**, **Express Middleware Pipelines**, **Mongoose Schema Design & Indexing**, and complete **RESTful CRUD Operations**.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Backend Concepts Demonstrated](#-key-backend-concepts-demonstrated)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Database Design](#-database-design)
- [Project Structure](#-project-structure)
- [Installation and Execution](#-installation-and-execution)
- [Environment Variables](#-environment-variables)
- [REST API Documentation](#-rest-api-documentation)
- [Sample API Requests & Postman Testing](#-sample-api-requests--postman-testing)
- [Security & IDOR Protection](#-security--idor-protection)
- [Automated Verification Test Suite](#-automated-verification-test-suite)
- [Demo Credentials](#-demo-credentials)

---

## 🌟 Overview

**TaskFlow** is designed for a university Backend Technologies curriculum to bridge theoretical backend concepts with practical, industry-grade implementation. The application isolates user data, verifies stateless cryptographic JWT tokens on every protected request, hashes passwords with `bcryptjs`, calculates live productivity statistics, and delivers a modern, responsive React interface.

---

## 🧠 Key Backend Concepts Demonstrated

| Concept | Implementation Details |
|---|---|
| **1. JWT Authentication** | Stateless token generation using `jsonwebtoken`, signed with HMAC-SHA256 (`JWT_SECRET`) and configurable expiration (`JWT_EXPIRES_IN`). |
| **2. Password Hashing** | Secure password hashing using `bcryptjs` with 10 salt rounds within a Mongoose `pre('save')` lifecycle hook. |
| **3. Express Middleware** | Custom `protect` authentication middleware parsing `Authorization: Bearer <token>`, validating token signature, and attaching `req.user`. |
| **4. REST API Architecture** | Structured resource paths with correct HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`) and explicit status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`). |
| **5. MongoDB & Mongoose ODM** | Database connectivity, schema validations, field constraints, timestamps, and custom schema methods (`matchPassword`, `generateAuthToken`). |
| **6. Compound Indexing** | Optimized MongoDB query performance with `{ userId: 1, status: 1 }` and `{ userId: 1, createdAt: -1 }`. |
| **7. CRUD Operations** | Full Create, Read (with pagination/filtering/search), Update, and Delete operations. |
| **8. IDOR Security Defense** | Insecure Direct Object Reference prevention: verification checks ensure users can never view, edit, or delete another user's task. |
| **9. Centralized Error Handling** | Unified error handling middleware classifying Mongoose `CastError`, `ValidationError`, MongoDB duplicate key `E11000`, and route 404s. |
| **10. Environment Variables** | Configuration segregation via `dotenv` with `.env` and `.env.example` templates. |

---

## 💻 Technology Stack

### Backend
- **Runtime Environment:** Node.js (v18+)
- **Framework:** Express.js (v4.21)
- **Database:** MongoDB with Mongoose (v8.9)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`)
- **Cryptography:** `bcryptjs`
- **CORS & Logging:** `cors`, `morgan`
- **Environment Management:** `dotenv`

### Frontend
- **Framework:** React.js (v18.3)
- **Tooling & Bundler:** Vite (v6)
- **Routing:** React Router DOM (v6.28)
- **HTTP Client:** Axios (v1.7) with request/response interceptors
- **Icons & Styling:** Lucide React, modern custom responsive CSS design system

---

## 🏗️ System Architecture

```
Client (React / Postman)
       │
       ▼  HTTP Request with Header: "Authorization: Bearer <JWT>"
[Express Application (server.js)]
       │
       ├─► Built-in / Third-Party Middleware:
       │     ├─ cors()
       │     ├─ express.json()
       │     └─ morgan('dev')
       │
       ├─► Route Dispatcher:
       │     ├─ /api/auth  ──► authController.js
       │     └─ /api/tasks ──► authMiddleware (protect) ──► taskController.js
       │
       ├─► Mongoose ODM Models:
       │     ├─ User (Password hashing hook, matchPassword, generateAuthToken)
       │     └─ Task (Compound indexes, userId ObjectId reference)
       │
       ├─► MongoDB Database (taskflow_db)
       │
       └─► Centralized Error Middleware (errorMiddleware.js)
```

---

## 🗄️ Database Design

### 1. Users Collection (`models/User.js`)
```javascript
{
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 2. Tasks Collection (`models/Task.js`)
```javascript
{
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, default: '', maxlength: 2000 },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  deadline: { type: Date, default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**Indexes:**
- `userId: 1` (Fast lookup by owner)
- `{ userId: 1, status: 1 }` (Optimized query filter by status)
- `{ userId: 1, createdAt: -1 }` (Optimized query sort by latest)

---

## 📂 Project Structure

```
Project/
├── package.json                    # Root scripts for testing, running, and building
├── README.md                       # Complete documentation & project manual
├── TaskFlow_Postman_Collection.json # Postman collection for 1-click import
│
├── backend/                        # Node.js & Express REST Backend
│   ├── .env                        # Active environment variables
│   ├── .env.example                # Example environment template
│   ├── package.json                # Backend dependencies and scripts
│   ├── server.js                   # Application entry point & Express bootstrap
│   ├── seed.js                     # Demo data seeder script
│   ├── run-and-test.js             # Automated test suite runner
│   ├── test-api.js                 # 15 automated integration tests
│   ├── config/
│   │   └── db.js                   # Mongoose connection & event listeners
│   ├── models/
│   │   ├── User.js                 # User schema, bcrypt hooks & token methods
│   │   └── Task.js                 # Task schema, enum validation & indexes
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT extraction & signature verification
│   │   └── errorMiddleware.js      # Centralized error handler & 404 handler
│   ├── controllers/
│   │   ├── authController.js       # Register, Login, GetProfile, Logout
│   │   └── taskController.js       # CRUD, IDOR checks, search, filtering, stats
│   └── routes/
│       ├── authRoutes.js           # /api/auth routes
│       └── taskRoutes.js           # /api/tasks routes
│
└── frontend/                       # Modern React (Vite) Application
    ├── index.html                  # HTML5 template with Inter fonts
    ├── vite.config.js              # Vite dev server & proxy settings
    ├── package.json                # Frontend dependencies
    └── src/
        ├── main.jsx                # React root mount
        ├── App.jsx                 # Routes & route protection setup
        ├── index.css               # Modern design system & CSS variables
        ├── context/
        │   └── AuthContext.jsx     # Global JWT auth state & localStorage sync
        ├── services/
        │   └── api.js              # Axios instance with interceptors
        ├── components/
        │   ├── common/
        │   │   ├── AppLayout.jsx   # Shell with persistent sidebar & header
        │   │   ├── Navbar.jsx      # Top navigation header & quick actions
        │   │   ├── Sidebar.jsx     # Modern sidebar navigation
        │   │   ├── Badge.jsx       # Priority & Status visual badges
        │   │   ├── Modal.jsx       # Accessible modal dialog
        │   │   ├── Toast.jsx       # Auto-dismissing notification toasts
        │   │   └── ProtectedRoute.jsx # Route guard redirecting to /login
        │   └── tasks/
        │       ├── TaskCard.jsx    # Card view with inline status switcher
        │       ├── TaskModal.jsx   # Create & Edit form dialog
        │       └── TaskFilters.jsx # Search, status tabs & sort controls
        └── pages/
            ├── LoginPage.jsx       # Login view with demo fill shortcut
            ├── RegisterPage.jsx    # Register view with field validation
            ├── DashboardPage.jsx   # Metrics, charts, progress & recent tasks
            ├── TasksPage.jsx       # Task list & grid with search & CRUD
            ├── ProfilePage.jsx     # User details & live JWT token inspector
            └── NotFoundPage.jsx    # 404 fallback page
```

---

## 🚀 Installation and Execution

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally on port 27017 or a MongoDB Atlas URI

### Step 1: Clone or Navigate to the Project
```bash
cd "d:\MCA CU\Sem 3\Backend Tech Lab\Project"
```

### Step 2: Install Dependencies
```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
cd ..
```

### Step 3: Configure Environment Variables
Verify or copy the environment configuration:
```bash
cd backend
cp .env.example .env
```
Default `backend/.env` contents:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow_db
JWT_SECRET=taskflow_jwt_secret_key_2026_mca_project
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Step 4: Seed Demo Data (Optional but Recommended)
Populates the database with realistic demo accounts and tasks for testing:
```bash
node backend/seed.js
```

### Step 5: Start the Application

You can run the application in either of two ways:

#### Option A: Unified Full-Stack Server (Recommended for Evaluation)
Build the frontend and run the single-port full-stack server on `http://localhost:5000`:
```bash
# Build frontend
cd frontend
npm run build
cd ..

# Start full-stack server
node backend/server.js
```
Open **[http://localhost:5000](http://localhost:5000)** in your web browser.

#### Option B: Independent Development Servers
- **Backend:**
  ```bash
  cd backend
  npm run dev
  # Server runs on http://localhost:5000
  ```
- **Frontend:**
  ```bash
  cd frontend
  npm run dev
  # Vite dev server runs on http://localhost:5173
  ```

---

## 📡 REST API Documentation

### Base URL: `http://localhost:5000/api`

### 1. Authentication Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register user & return signed JWT token |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials & return JWT |
| `GET` | `/api/auth/profile` | Protected | Get authenticated user profile (`Bearer <token>`) |
| `POST` | `/api/auth/logout` | Public | Stateless logout confirmation |

### 2. Task Management Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/tasks` | Protected | Create a new task linked to `req.user._id` |
| `GET` | `/api/tasks` | Protected | List tasks with query search, filters & sort |
| `GET` | `/api/tasks/stats` | Protected | Aggregate statistics (Total, Status, Overdue, Rate) |
| `GET` | `/api/tasks/:id` | Protected | Get single task by ID (validates ownership) |
| `PUT` | `/api/tasks/:id` | Protected | Update task fields (validates ownership) |
| `DELETE` | `/api/tasks/:id` | Protected | Permanently delete task (validates ownership) |

### 3. System Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Server uptime and database connectivity check |
| `GET` | `/api` | Public | Root API documentation summary |

---

## 🧪 Sample API Requests & Postman Testing

### 1. Register a User (`POST /api/auth/register`)
**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@university.edu",
    "password": "Password123!"
  }'
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6ae840a924892ff51e1158d3",
    "name": "Alice Johnson",
    "email": "alice@university.edu",
    "createdAt": "2026-11-02T07:46:19.000Z"
  }
}
```

### 2. Login User (`POST /api/auth/login`)
**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@university.edu",
    "password": "Password123!"
  }'
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6ae840a924892ff51e1158d3",
    "name": "Alice Johnson",
    "email": "alice@university.edu"
  }
}
```

### 3. Create a Task (`POST /api/tasks`)
**Request:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "title": "Submit Backend Technologies Report",
    "description": "Prepare comprehensive code documentation and test cases.",
    "priority": "High",
    "status": "In Progress",
    "deadline": "2026-11-10T18:00:00.000Z"
  }'
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully!",
  "task": {
    "_id": "6ae840a924892ff51e1158d5",
    "title": "Submit Backend Technologies Report",
    "description": "Prepare comprehensive code documentation and test cases.",
    "priority": "High",
    "status": "In Progress",
    "deadline": "2026-11-10T18:00:00.000Z",
    "userId": "6ae840a924892ff51e1158d3",
    "createdAt": "2026-11-02T07:48:00.000Z"
  }
}
```

### 4. Get Task Statistics (`GET /api/tasks/stats`)
**Request:**
```bash
curl -X GET http://localhost:5000/api/tasks/stats \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```
**Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "total": 5,
    "pending": 2,
    "inProgress": 1,
    "completed": 2,
    "overdue": 0,
    "completionRate": 40,
    "priorities": {
      "high": 3,
      "medium": 1,
      "low": 1
    }
  },
  "recentTasks": [...]
}
```

### 5. Import Postman Collection
Import the file `TaskFlow_Postman_Collection.json` directly into Postman:
1. Open Postman.
2. Click **Import** in the upper left.
3. Select `TaskFlow_Postman_Collection.json` from the project directory.
4. Run the **Login User** request — it automatically sets the collection variable `authToken` for subsequent requests!

---

## 🔒 Security & IDOR Protection

**Insecure Direct Object Reference (IDOR)** occurs when an application exposes a reference to an internal object (such as a MongoDB ObjectId in the URL param) and fails to verify whether the requesting user actually owns that object.

In TaskFlow, every single task query and mutation enforces strict ownership validation:

```javascript
// Located in backend/controllers/taskController.js
const task = await Task.findById(req.params.id);

if (!task) {
  return res.status(404).json({ success: false, message: 'Task not found.' });
}

// CRITICAL SECURITY DEFENSE:
if (task.userId.toString() !== req.user._id.toString()) {
  return res.status(403).json({
    success: false,
    message: "Access denied: You are not authorized to view or modify another user's task."
  });
}
```

If User B attempts to perform `GET`, `PUT`, or `DELETE` on User A's task ID, the backend immediately responds with **`403 Forbidden`**.

---

## 🧪 Automated Verification Test Suite

The project includes an end-to-end automated test runner validating all 15 core requirements:

```bash
node backend/run-and-test.js
```

### Test Suite Execution Output:
```text
[Runner] Starting Express server in background...
[Database] MongoDB Connected: 127.0.0.1/taskflow_db

--- 🚀 Starting TaskFlow Backend Verification Tests ---

1. Testing Health Endpoint: GET /api/health
✅ PASSED: Health check returns 200 UP

2. Testing User Registration: POST /api/auth/register
✅ PASSED: User A registered with 201 Created
✅ PASSED: JWT token issued upon registration
✅ PASSED: User profile returned with email
✅ PASSED: Password hash is NOT exposed in response

3. Testing Duplicate Registration Prevention
✅ PASSED: Duplicate email registration correctly rejected with 400 Bad Request

4. Testing User Login: POST /api/auth/login
✅ PASSED: Login succeeded with 200 OK
✅ PASSED: Login returned valid JWT token

5. Testing Login with Invalid Password
✅ PASSED: Invalid credentials rejected with 401 Unauthorized

6. Testing Access to Protected Route Without Token: GET /api/auth/profile
✅ PASSED: Protected route denied with 401 when token is missing

7. Testing Access to Protected Route With Valid Token
✅ PASSED: Profile retrieved with Bearer token

8. Testing Task Creation: POST /api/tasks
✅ PASSED: Task created with 201 Created
✅ PASSED: Task title correctly saved
✅ PASSED: Priority correctly set to High
✅ PASSED: Second task created successfully

9. Testing Task Retrieval: GET /api/tasks
✅ PASSED: Retrieved all tasks for User A (count = 2)

10. Testing Task Filtering: GET /api/tasks?status=Pending
✅ PASSED: Status filter returned only Pending tasks

11. Testing Task Search: GET /api/tasks?search=Backend
✅ PASSED: Search query found matching task

12. Testing Task Update: PUT /api/tasks/:id
✅ PASSED: Task status updated to Completed

13. Testing Task Statistics: GET /api/tasks/stats
✅ PASSED: Stats endpoint returns 200 OK
✅ PASSED: Total tasks count is 2
✅ PASSED: Completed tasks count is 1
✅ PASSED: In Progress tasks count is 1
✅ PASSED: Completion rate is 50%

14. Testing IDOR Protection (User B trying to access/modify/delete User A's task)
✅ PASSED: User B blocked from viewing User A's task (403 Forbidden)
✅ PASSED: User B blocked from updating User A's task (403 Forbidden)
✅ PASSED: User B blocked from deleting User A's task (403 Forbidden)

15. Testing Task Deletion: DELETE /api/tasks/:id
✅ PASSED: User A successfully deleted task
✅ PASSED: Task count decreased to 1 after deletion

🎉 ALL 15 BACKEND TESTS PASSED SUCCESSFULLY! 🎉
```

---

## 🔑 Demo Credentials

| Account | Email | Password | Role / Purpose |
|---|---|---|---|
| **Demo User 1** | `alice_demo@university.edu` | `Password123!` | Primary demo account with populated tasks & statistics |
| **Demo User 2** | `bob_demo@university.edu` | `Password123!` | Secondary account used for verifying IDOR isolation |

*(You can also click the **Quick Demo Fill** button directly on the login screen to automatically populate these credentials)*.

---

## 🎓 University Evaluation Summary

This project was built to address all scoring criteria for the **MCA Semester 3 Backend Technologies Lab**:
- **Stateless Authentication:** JSON Web Token with HMAC SHA-256 signing and verification.
- **Data Protection:** 10 salt rounds bcrypt hashing in Mongoose pre-save hooks.
- **Request Pipelines:** Custom Express authorization middleware and centralized error middleware.
- **REST Conformance:** Semantic resource design and strict HTTP response codes.
- **Data Modeling:** Mongoose models with validation, compound indexing, and relational object references.
- **Frontend Integration:** Production-bundled React single-page application communicating via Axios with token interceptors.

