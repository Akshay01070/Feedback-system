# IIIT Gwalior Feedback System

A full-stack web application for collecting and managing student feedback for faculty at ABV-IIITM Gwalior.

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Express.js + Node.js
- **Database:** MongoDB

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (v7.0)

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd Feedback-system
```

### 2. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Environment variables

Create a `.env` file inside `client/`:

```
VITE_API_URL=http://localhost:5000
```

Create a `.env` file inside `server/` (optional — defaults are used if missing):

```
MONGO_URI=mongodb://127.0.0.1:27017/feedback-system
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 4. Start MongoDB

```bash
cd server
npm run start-db
```

> This starts `mongod` with a local `data/` folder. Keep this terminal open.

### 5. Seed the database (optional)

```bash
cd server
node create_accounts.js
```

This creates test accounts (5 students, 5 teachers, 1 admin) and drops all existing data.

**Default credentials:** all passwords are `Test@123`

| Role    | Email              |
|---------|--------------------|
| Student | student1@test.com  |
| Student | student2@test.com  |
| Student | student3@test.com  |
| Student | student4@test.com  |
| Student | student5@test.com  |
| Teacher | teacher1@test.com  |
| Teacher | teacher2@test.com  |
| Teacher | teacher3@test.com  |
| Teacher | teacher4@test.com  |
| Teacher | teacher5@test.com  |
| Admin   | admin@test.com     |

### 6. Run the backend

```bash
cd server
npm run dev
```

Server starts on `http://localhost:5000` with live-reload (nodemon).

### 7. Run the frontend

```bash
cd client
npm run dev
```

App opens at `http://localhost:5173`.

## Project Structure

```
Feedback-system/
├── client/               # React frontend (Vite)
│   ├── public/           # Static assets (college logo, etc.)
│   └── src/
│       └── components/   # React components
├── server/               # Express backend
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── create_accounts.js # DB seeding script
│   └── index.js          # Server entry point
└── data/                 # Local MongoDB data directory
```
