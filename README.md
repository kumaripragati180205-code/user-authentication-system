# AuthShield — Production User Authentication System

A production-grade, full-stack user authentication system built with **React, Node.js, Express, and PostgreSQL / SQLite**. Engineered to demonstrate how high-traffic web applications handle security, encryption, token lifecycles, and access control.

---

## 🌟 Features Implemented

| Feature | Implementation Details |
| :--- | :--- |
| **User Registration** | Input validation, unique email enforcement, password strength assessment, initial role assignment. |
| **Password Hashing** | Bcrypt with **12 adaptive salt rounds**. Plaintext passwords never hit the database. Timing-safe comparison. |
| **Login & Logout** | Issues short-lived access tokens (JWT) and persistent refresh tokens in HTTP-only cookies. |
| **Short-Lived Access Tokens** | Stateless **JSON Web Tokens (JWT)** with 15-minute expiration signed with HMAC-SHA256. |
| **Refresh Token Rotation** | Cryptographic 64-character hex tokens stored **hashed (SHA-256)** in database with 7-day expiration and automatic client-side silent renewal. |
| **Protected Routes** | JWT Bearer authentication middleware on backend and route guards on React frontend. |
| **Role-Based Access Control (RBAC)** | `requireRole(['admin'])` middleware guarding administrative endpoints (user management, audit logs, role promotion/demotion). |
| **Password Reset Flow** | Time-limited (15-min) cryptographic reset tokens, stored hashed in the DB to prevent breach exposure. In-app simulated email inbox for effortless testing. |
| **Security Audit Logs** | Comprehensive audit trail logging every registration, login, logout, password change, and role update with IP and user-agent. |
| **Dual Database Architecture** | Zero-configuration local SQLite engine out-of-the-box + instant PostgreSQL compatibility with ready migrations. |
| **Auth Lab & JWT Inspector** | In-app live visualizer dissecting JWT tokens, testing password entropy, and simulating silent token rotation. |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
Run from the root directory:
```bash
# On Windows PowerShell
npm.cmd run install:all
```

### 2. Start Both Backend & Frontend Concurrently
```bash
npm.cmd run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 👥 Seeded Demo Accounts

You can test both roles immediately using the 1-click login buttons on the homepage/login page:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@authshield.io` | `Admin@123` | Full access to Admin Panel, user management, and security audit logs. |
| **Standard User** | `user@authshield.io` | `User@123` | User Dashboard, personal profile, password change, and session status. |

---

## 🏗️ Architecture & Security Principles

### 1. Bcrypt Password Hashing
```
Plaintext Password + 12-round Cryptographic Salt ---> Bcrypt Engine ---> $2a$12$...60-char-hash
```
- **Why 12 Rounds?** \(2^{12} = 4,096\) iterations. This slows brute-force attacks from billions of tries per second on GPUs to a few hundred.
- **Why Salt?** Ensures identical passwords produce completely unique hashes, neutralizing pre-computed rainbow table attacks.

### 2. JWT Access Token + Refresh Token Lifecycle
```
[Client]                                           [Server]
   |                                                  |
   |--- POST /api/auth/login ------------------------>| Verifies bcrypt hash
   |<-- 200 OK (JWT 15m + httpOnly Refresh Token) ----|
   |                                                  |
   |--- GET /api/user/profile (Bearer <JWT>) -------->| Middleware verifies signature
   |<-- 200 OK (Profile Data) ------------------------|
   |                                                  |
   | (15 minutes pass - JWT expires)                  |
   |--- GET /api/user/profile (Expired JWT) --------->| Returns 401 TOKEN_EXPIRED
   |<-- 401 Unauthorized -----------------------------|
   |                                                  |
   |--- POST /api/auth/refresh (httpOnly cookie) ---->| Validates & rotates refresh token
   |<-- 200 OK (Fresh JWT Access Token) --------------|
   |                                                  |
   |--- Retries original GET /api/user/profile ------>| Transparently succeeds!
```

### 3. Password Reset Security
- **Token Generation:** 32 bytes of cryptographic randomness: `crypto.randomBytes(32).toString('hex')`.
- **Database Hashing:** The database only stores `SHA-256(token)`. If the database is ever leaked, the attacker cannot use the dump to reset accounts.
- **Short Expiration:** Valid for only 15 minutes.
- **Session Revocation:** Resetting the password automatically revokes all existing refresh tokens across all devices.

---

## 🗄️ Database Options

### Option A: Local SQLite (Default)
Runs instantly with zero setup. Creates a database file at `server/data/authshield.sqlite`.

### Option B: PostgreSQL
Set the following in `server/.env`:
```env
DB_TYPE=postgres
DATABASE_URL=postgres://username:password@localhost:5432/authshield
```
PostgreSQL schema is available at `server/src/db/schema.sql`.

---

## 🧪 Running Automated Tests

AuthShield includes an automated end-to-end test suite verifying all 13 core security flows:
```bash
# Terminal 1: Start server
cd server
npm.cmd run dev

# Terminal 2: Run test suite
cd server
node test-auth.js
```

