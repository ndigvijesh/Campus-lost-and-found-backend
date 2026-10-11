# Campus Lost and Found - Backend API

RESTful backend service for the **Campus Lost and Found** platform, built with Node.js, Express 5, and MongoDB Atlas (Mongoose 9).

---

## 🚀 Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express 5
- **Database**: MongoDB Atlas / Mongoose 9
- **Authentication**: JWT (JSON Web Tokens) + bcrypt password hashing
- **File Uploads**: Multer
- **API Documentation**: Swagger UI (`/api-docs`)
- **Logging**: Winston + Morgan

---

## 🛠️ Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ or 20+ recommended)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or local MongoDB)

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure the required variables:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/campus_lf?retryWrites=true&w=majority
DATABASE_NAME=campus_lf

JWT_SECRET=your_jwt_secret_key_here
JWT_ACCESS_EXPIRATION_TTL=86400

# Admin Seed Credentials (automatically seeded if not present)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_admin_password
ADMIN_FIRSTNAME=Example
ADMIN_LASTNAME=Admin

# Frontend CORS
FRONTEND_URL=http://localhost:5173
```

### 4. Run Development Server
```bash
npm run dev
```

The server will start at `http://localhost:3001`.

---

## 📡 Endpoints & Features

- **Health Check**: `GET /health` — Returns service health status
- **Interactive Swagger Docs**: `GET /api-docs` — Full interactive API documentation
- **Authentication**: `POST /login`, `POST /users/create`
- **Items**: `GET /getitems`, `POST /items`, `GET /items/:id`, `PATCH /items/:id`
- **Claims**: `POST /claims`, `GET /claims/my`, `PATCH /claims/:id/approve`
- **Matches**: Automatic matching algorithm for lost & found items

---

## 🌐 Production Deployment (Render, Railway, Heroku)

### Deployment on Render:
1. Create a new **Web Service** on Render and connect this repository:
   `https://github.com/ndigvijesh/Campus-lost-and-found-backend.git`
2. Leave **Root Directory** blank (the repository root contains `server.js` and `package.json`).
3. **Build Command**: `npm ci`
4. **Start Command**: `npm start`
5. Set the **Health Check Path** to `/health`.
6. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: your MongoDB connection string (or use `DATABASE_URL` instead)
   - `DATABASE_NAME`: `campus_lf`
   - `JWT_SECRET`: a secure random secret key
   - `JWT_ACCESS_EXPIRATION_TTL`: token lifetime in seconds (for example, `86400`)
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD`: credentials for the seeded admin account
   - `FRONTEND_URL`: your deployed frontend URL (e.g. `https://campus-lost-and-found-frontend.vercel.app`)

The [`render.yaml`](./render.yaml) file provides these service settings when deploying with a Render Blueprint. Enter the values for variables marked `sync: false` in the Render dashboard; do not add a `PORT` variable because Render sets it automatically.

Uploaded files are stored on the service filesystem by default. Render's default filesystem is ephemeral, so configure a persistent disk for the uploads directory if uploaded images must survive deploys or restarts.

The server reads hosting-platform variables directly from `process.env`. A local `.env` file is optional and is only used for local development.
