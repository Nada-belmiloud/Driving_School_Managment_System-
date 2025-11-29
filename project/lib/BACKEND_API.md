# Driving School Management System; Backend API Guide

this document explains how frontend should talk to the Node.js/Express API that lives in `project/lib`.

> **Base URL**: `http://localhost:<PORT>/api/v1` 
>(see `.env.example` for the exact `PORT`).

Most endpoints are protected. Always include `Authorization: Bearer <JWT>` except for `/auth/login`, `/auth/register`, and `/health`.

## 1. how to start the backend

1. Run the backend (from `project/lib`): `npm install && npm run dev`, dont forget to create `.env` file and configure it.
2. Copy `.env.example` to `.env` and set:
   - `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `DEFAULT_PAGE_SIZE`, `CORS_ORIGIN`.
3. Once the server starts with no errors you can inspect Swagger docs at `/api-docs` for live schemas.

## 2. Shared Conventions

- **Headers**: `Content-Type: application/json` + `Authorization: Bearer <token>` when required.
- **Pagination**: standard `page` (default 1) and `limit` (default `DEFAULT_PAGE_SIZE`). Responses include `pagination` with `page`, `limit`, `total`, `pages`.
- **Filtering & Sorting**: many list endpoints accept `search`, `status`, `licenseType`, `sortBy`, etc., as noted below.
- **Dates**: send ISO 8601 strings (`2025-01-15T09:00:00.000Z`) unless the controller specifically asks for `YYYY-MM-DD` and `HH:MM` (lessons).
- **Errors**: failures follow `{ success: false, error: "message" }` with appropriate HTTP codes (see `middleware/error.middleware.js`). Validation issues return code `400`.

## 3. Authentication (`/auth`)

| Method | Path | Description                           | Body                   |
| ------ | ---- |---------------------------------------|------------------------|
| POST | `/auth/register` | add new admin (rate-limited)          | `{ name, email, password, role? }` 
| POST | `/auth/login` | login and receive JWT (rate-limited)  | `{ email, password }`  
| GET | `/auth/me` | get current admin profile             |                        |
| PUT | `/auth/updatepassword` | update password                       | `{ currentPassword, newPassword }` 
| POST | `/auth/logout` | logout (token removal is client-side) |                        |

**Sample Login Request**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "secret123"
}
```
**Sample Response**
```json
{
  "success": true,
  "data": {
    "id": "663...",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin",
    "token": "<JWT>"
  }
}
```

Use the returned `token` for all other endpoints.

## 4. Students / Candidates (`/students`)

- `GET /students?search=&licenseType=B&sortBy=-registrationDate&page=1&limit=10`
  - Returns `{ success, count, pagination, data: [students] }`.
- `GET /students/:id`: get single student.
- `POST /students` : create student. Body must include `name`, `email`, `phone`, `licenseType`, plus optional `address`, `dateOfBirth`, `notes`.
- `PUT /students/:id` : update fields (email uniqueness enforced).
- `DELETE /students/:id` : removes student (fails with 404 if missing).
- `GET /students/stats` : get counts `{ total, recentlyRegistered, byLicenseType }`.

**Create Student Example**
```json
{
  "name": "Sara Ali",
  "email": "sara.ali@example.com",
  "phone": "1234567890",
  "licenseType": "B",
  "address": "downtown",
  "notes": "additional notes"
}
```
**Response**
```json
{
  "success": true,
  "data": {
    "_id": "665...",
    "name": "Sara Ali",
    "licenseType": "B",
    "status": "active",
    "createdAt": "2025-12-01T09:10:00.000Z"
  },
  "message": "Student created successfully"
}
```

## 5. Instructors (`/instructors`)

- `GET /instructors`: list with optional `search`, pagination, etc.
- `POST /instructors`: requires `name`, `email`, `phone`.
- `GET /instructors/:id`, `PUT /:id`, `DELETE /:id` – standard CRUD.
- `GET /instructors/stats`: get data (totals, availability per controller implementation).
- `GET /instructors/:id/schedule` – returns scheduled lessons for the instructor.

## 6. Vehicles (`/vehicles`)

list endpoint accepts filters: `status`, `transmission`, `fuelType`, `minYear`, `maxYear`, `search`, `sortBy`. Responses include per-vehicle `stats` (total/completed/scheduled lessons, `maintenanceDue`).

Routes:
- `GET /vehicles`: list.
- `POST /vehicles`: create vehicle. Required: `plateNumber`, `model`, `year`, `fuelType`, `transmission`; optional fields include `vin`, `mileage`, `features`, etc.
- `GET /vehicles/:id`, `PUT /:id`, `DELETE /:id` – standard CRUD. Deletes blocked if vehicle has scheduled lessons.
- `GET /vehicles/:id/availability?date=2025-05-01` or `?startDate=...&endDate=...` – returns `{ isAvailable, scheduledLessons[] }`.
- `GET /vehicles/:id/maintenance` – maintenance history and totals.
- `POST /vehicles/:id/maintenance` – add record `{ type, description, cost, performedBy?, parts?, nextMaintenanceDate?, nextMaintenanceMileage? }`.
- `PUT /vehicles/:id/maintenance/:maintenanceId` and `DELETE` – manage maintenance records.
- `PATCH /vehicles/:id/mileage` – body `{ mileage: number }` (must be >= current mileage).
- `GET /vehicles/stats` – aggregated fleet metrics.

## 7. Lessons (`/lessons`)

- `GET /lessons` – list with pagination and filtering (see controller for additional query params like `status`).
- `POST /lessons` – requires `{ studentId, instructorId, vehicleId, date, time, duration?, type?, notes? }`. `time` must be `HH:MM`.
- `GET /lessons/:id`, `PUT /:id`, `DELETE /:id` – manage single lesson.
- `PUT /lessons/:id/complete` – marks lesson as completed.
- `POST /lessons/check-availability` – body example:
  ```json
  {
    "studentId": "664...",
    "instructorId": "662...",
    "vehicleId": "661...",
    "date": "2025-05-10",
    "time": "09:00",
    "duration": 60
  }
  ```
  Returns availability plus conflicts.
- `GET /lessons/stats` – metrics (completions, cancellations, etc.).
- `GET /lessons/calendar?start=2025-05-01&end=2025-05-31` – month view.
- `POST /lessons/bulk-schedule` – create multiple lessons; pass array of lesson payloads.
- `GET /lessons/upcoming` – next lessons prioritized by soonest `date`.

## 8. Payments (`/payments`)

- `GET /payments` – supports pagination and filtering by `status`, `method`, `dateRange` (per controller logic).
- `POST /payments` – `{ studentId, amount, method, status?, dueDate?, reference?, notes? }`. `amount` must be positive.
- `GET /payments/:id`, `PUT /:id`, `DELETE /:id` – manage payments.
- `PUT /payments/:id/mark-paid` – convenience endpoint to set status to paid and stamp payment date.
- `GET /payments/stats` – totals, outstanding amounts, etc.
- `GET /payments/pending` – only outstanding payments.
- `GET /payments/student/:studentId` – all payments for a student.

**Add Payment Example**
```json
{
  "studentId": "665...",
  "amount": 250,
  "method": "card",
  "dueDate": "2025-05-20",
  "notes": "Installment 1"
}
```

## 9. Settings (`/settings`)

All settings routes use `router.use(protect)` so every path beneath `/settings` requires auth.

- `GET /settings` – full snapshot of profile + preferences.
- `PUT /settings/profile` – update admin profile (name, email, phone, avatar, etc.).
- Notifications: `GET /settings/notifications`, `PUT /settings/notifications`.
- Appearance (theme, layout): `GET /settings/appearance`, `PUT /settings/appearance`.
- Security: `GET /settings/security`, `POST /settings/security/two-factor` (enable/disable), `DELETE /settings/security/sessions/:sessionId` (force logout of a device).
- Backups: `GET /settings/backups`, `PUT /settings/backups/preferences`, `POST /settings/backups` (create), `POST /settings/backups/:backupId/restore`, `GET /settings/backups/:backupId/download`.
- System utilities: `GET /settings/system`, `POST /settings/system/clear-cache`, `POST /settings/system/optimize-database`, `POST /settings/system/export-logs`.

Expect `{ success: true, data: { ... } }` responses mirroring controller logic. Mutations usually return a confirmation `message` as well.

## 10. Dashboard (`/dashboard`)

- `GET /dashboard/stats` – totals for students, lessons, revenue, etc.
- `GET /dashboard/activities` – recent actions feed (students added, payments recorded, etc.).
- `GET /dashboard/charts` – structured data meant for client-side visualizations (arrays ready for recharts/chart.js).

## 11. Health & Misc

- `GET /health` – unauthenticated heartbeat `{ success, message, timestamp, environment, uptime }`.
- `GET /` – root API descriptor (lists endpoints and links to `/api-docs`).

## 12. Error Reference

if you face this errors, here is how to handle them:

| HTTP code | reason                                                          | how to handle                                 |
|-----------|-----------------------------------------------------------------|-----------------------------------------------|
| 400       | Validation error (missing field, duplicate email, invalid time) | Show inline error. Message comes from server. |
| 401       | Missing/invalid token                                           | Redirect to login, refresh token.             |
| 403       | Forbidden (role check)                                          | Hide UI or show insufficient rights message.  |
| 404       | Resource not found (invalid ID, deleted entity)                 | Show not-found state.                         |
| 429       | Rate limited (login/register)                                   | Display retry wait guidance.                  |
| 500       | Unhandled server error                                          | Retry later or contact support.               |
