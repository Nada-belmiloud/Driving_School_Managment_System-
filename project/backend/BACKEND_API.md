# Driving School Management System - Backend API Guide

This document explains how the frontend should communicate with the Node.js/Express backend API located in `project/backend`.

> **Base URL**: `http://localhost:5000/api/v1`  
> (configurable via `PORT` in `.env`)

Most endpoints are protected. Always include `Authorization: Bearer <JWT>` except for `/auth/login` and `/health`.

---

## 1. Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (running locally or MongoDB Atlas)

### Installation

```bash
cd project/backend
npm install
```

### Configuration

1. Copy `.env.example` to `.env`
2. Configure the following variables:
   - `NODE_ENV` - development or production
   - `PORT` - Server port (default: 5000)
   - `MONGO_URI` - MongoDB connection string
   - `JWT_SECRET` - JWT secret key (min 32 characters)
   - `JWT_EXPIRE` - Token expiration (default: 7d)
   - `CORS_ORIGIN` - Frontend URL (default: http://localhost:3000)

### Running the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start

# Seed admin user
npm run seed:admin
```

### API Documentation

Swagger documentation is available at `/api-docs` when the server is running.

---

## 2. Shared Conventions

### Headers
```
Content-Type: application/json
Authorization: Bearer <token>  (for protected routes)
```

### Pagination
Most list endpoints support:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

Response includes:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Filtering & Sorting
- `search` - Text search (name, email, phone)
- `status` - Filter by status
- `sortBy` - Sort field (prefix with `-` for descending)

### Date Formats
- Dates: `YYYY-MM-DD` (e.g., `2025-01-15`)
- Times: `HH:MM` (e.g., `09:00`)

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## 3. API Endpoints Overview

### Authentication (`/auth`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/auth/login` | Login admin | No |
| GET | `/auth/me` | Get current admin | Yes |
| PUT | `/auth/email` | Update email | Yes |
| PUT | `/auth/password` | Update password | Yes |
| PUT | `/auth/name` | Update name | Yes |
| POST | `/auth/logout` | Logout | Yes |

### Candidates (`/candidates`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/candidates` | Get all candidates | Yes |
| GET | `/candidates/count` | Get candidate count | Yes |
| GET | `/candidates/:id` | Get single candidate | Yes |
| POST | `/candidates` | Create candidate | Yes |
| PUT | `/candidates/:id` | Update candidate | Yes |
| DELETE | `/candidates/:id` | Delete candidate | Yes |
| PUT | `/candidates/:id/progress` | Update progress | Yes |

### Instructors (`/instructors`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/instructors` | Get all instructors | Yes |
| GET | `/instructors/count` | Get instructor count | Yes |
| GET | `/instructors/:id` | Get single instructor | Yes |
| POST | `/instructors` | Create instructor | Yes |
| PUT | `/instructors/:id` | Update instructor | Yes |
| DELETE | `/instructors/:id` | Delete instructor | Yes |
| PUT | `/instructors/:id/assign-vehicle` | Assign vehicle | Yes |

### Vehicles (`/vehicles`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/vehicles` | Get all vehicles | Yes |
| GET | `/vehicles/count` | Get vehicle count | Yes |
| GET | `/vehicles/:id` | Get single vehicle | Yes |
| POST | `/vehicles` | Create vehicle | Yes |
| PUT | `/vehicles/:id` | Update vehicle | Yes |
| DELETE | `/vehicles/:id` | Delete vehicle | Yes |
| PUT | `/vehicles/:id/assign-instructor` | Assign instructor | Yes |
| GET | `/vehicles/:id/maintenance-logs` | Get maintenance logs | Yes |
| POST | `/vehicles/:id/maintenance-logs` | Add maintenance log | Yes |
| PUT | `/vehicles/:id/maintenance-logs/:logId` | Update maintenance log | Yes |

### Schedule (`/schedule`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/schedule` | Get all sessions | Yes |
| GET | `/schedule/upcoming` | Get upcoming sessions | Yes |
| GET | `/schedule/candidate/:candidateId` | Get candidate sessions | Yes |
| GET | `/schedule/instructor/:instructorId` | Get instructor sessions | Yes |
| GET | `/schedule/:id` | Get single session | Yes |
| POST | `/schedule` | Create session | Yes |
| PUT | `/schedule/:id` | Update session | Yes |
| DELETE | `/schedule/:id` | Cancel session | Yes |
| PUT | `/schedule/:id/complete` | Mark as completed | Yes |

### Exams (`/exams`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/exams` | Get all exams | Yes |
| GET | `/exams/upcoming` | Get upcoming exams | Yes |
| GET | `/exams/candidate/:candidateId` | Get candidate exams | Yes |
| GET | `/exams/can-take/:candidateId/:examType` | Check can take exam | Yes |
| GET | `/exams/:id` | Get single exam | Yes |
| POST | `/exams` | Schedule exam | Yes |
| PUT | `/exams/:id` | Update exam | Yes |
| DELETE | `/exams/:id` | Cancel exam | Yes |
| PUT | `/exams/:id/result` | Record result | Yes |

### Payments (`/payments`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/payments` | Get all payments | Yes |
| GET | `/payments/pending` | Get pending payments | Yes |
| GET | `/payments/pending/count` | Get pending count | Yes |
| GET | `/payments/candidate/:candidateId` | Get candidate payments | Yes |
| GET | `/payments/:id` | Get single payment | Yes |
| POST | `/payments` | Create payment | Yes |
| PUT | `/payments/:id` | Update payment | Yes |
| DELETE | `/payments/:id` | Delete payment | Yes |
| PUT | `/payments/:id/mark-paid` | Mark as paid | Yes |

### Settings (`/settings`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/settings` | Get settings | Yes |
| PUT | `/settings/name` | Update name | Yes |
| PUT | `/settings/email` | Update email | Yes |
| PUT | `/settings/password` | Update password | Yes |

### Dashboard (`/dashboard`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/dashboard/stats` | Get dashboard statistics | Yes |

---

## 4. Sample API Calls

### Login

```javascript
const response = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@drivingschool.com',
    password: 'password123'
  })
});
const data = await response.json();
// Store token: localStorage.setItem('token', data.data.token);
```

### Get Candidates (with pagination)

```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:5000/api/v1/candidates?page=1&limit=10&status=active', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
// data.data = array of candidates
// data.pagination = { page, limit, total, pages }
```

### Create Candidate

```javascript
const response = await fetch('http://localhost:5000/api/v1/candidates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Mohammed Ali',
    email: 'mohammed@example.com',
    phone: '0551234567',
    licenseType: 'B'
  })
});
```

### Schedule a Session

```javascript
const response = await fetch('http://localhost:5000/api/v1/schedule', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    candidateId: '64abc123...',
    instructorId: '64def456...',
    date: '2025-01-20',
    time: '10:00',
    lessonType: 'driving'
  })
});
```

---

## 5. Data Types Reference

### License Types
`A1`, `A2`, `B`, `C1`, `C2`, `D`

### Progress/Lesson/Exam Types
`highway_code`, `parking`, `driving`

### Candidate Status
`active`, `completed`, `deleted`

### Instructor Status
`active`, `deleted`

### Vehicle Status
`active`, `maintenance`, `retired`

### Schedule Status
`scheduled`, `cancelled`, `completed`

### Exam Status
`scheduled`, `passed`, `failed`, `cancelled`

### Payment Status
`pending`, `paid`

---

## 6. Security Features

- **JWT Authentication** - Tokens expire after 7 days
- **Rate Limiting** - Login endpoint has stricter limits
- **Helmet** - Security headers enabled
- **CORS** - Configured for frontend origin
- **MongoDB Sanitization** - Prevents NoSQL injection
- **XSS Protection** - Request sanitization enabled

---

## 7. Detailed Documentation

For complete endpoint documentation with examples, see:

- [API Reference](./API_REFERENCE.md)
- [Auth API](./docs/api/AUTH.md)
- [Candidates API](./docs/api/CANDIDATES.md)
- [Instructors API](./docs/api/INSTRUCTORS.md)
- [Vehicles API](./docs/api/VEHICLES.md)
- [Schedule API](./docs/api/SCHEDULE.md)
- [Exams API](./docs/api/EXAMS.md)
- [Payments API](./docs/api/PAYMENTS.md)
- [Settings API](./docs/api/SETTINGS.md)
- [Dashboard API](./docs/api/DASHBOARD.md)

