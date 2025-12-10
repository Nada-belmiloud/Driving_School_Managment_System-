# Driving School Management System - API Reference

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Login
- **POST** `/auth/login`
- Body: `{ email, password }`
- Returns: `{ success, data: { id, name, email, token } }`

### Get Current User
- **GET** `/auth/me`
- Protected: Yes
- Returns: `{ success, data: { id, name, email } }`

### Update Email
- **PUT** `/auth/email`
- Protected: Yes
- Body: `{ email, password }`

### Update Password
- **PUT** `/auth/password`
- Protected: Yes
- Body: `{ currentPassword, newPassword }`

### Update Name
- **PUT** `/auth/name`
- Protected: Yes
- Body: `{ name }`

### Logout
- **POST** `/auth/logout`
- Protected: Yes

---

## Candidates Endpoints

### Get All Candidates
- **GET** `/candidates`
- Protected: Yes
- Query params: `page`, `limit`, `licenseType`, `status`, `progress`, `search`, `sortBy`

### Get Candidate Count
- **GET** `/candidates/count`
- Protected: Yes

### Get Single Candidate
- **GET** `/candidates/:id`
- Protected: Yes

### Create Candidate
- **POST** `/candidates`
- Protected: Yes
- Body: `{ name, email, phone, address?, dateOfBirth?, licenseType, progress? }`
- License types: `A1`, `A2`, `B`, `C1`, `C2`, `D`
- Progress values: `highway_code`, `parking`, `driving`

### Update Candidate
- **PUT** `/candidates/:id`
- Protected: Yes

### Delete Candidate (Soft Delete)
- **DELETE** `/candidates/:id`
- Protected: Yes

### Update Progress
- **PUT** `/candidates/:id/progress`
- Protected: Yes
- Body: `{ progress }` (highway_code, parking, driving)

---

## Instructors Endpoints

### Get All Instructors
- **GET** `/instructors`
- Protected: Yes
- Query params: `page`, `limit`, `status`, `search`, `sortBy`

### Get Instructor Count
- **GET** `/instructors/count`
- Protected: Yes

### Get Single Instructor
- **GET** `/instructors/:id`
- Protected: Yes

### Create Instructor
- **POST** `/instructors`
- Protected: Yes
- Body: `{ name, email, phone, address? }`

### Update Instructor
- **PUT** `/instructors/:id`
- Protected: Yes

### Delete Instructor (Soft Delete)
- **DELETE** `/instructors/:id`
- Protected: Yes

### Assign Vehicle to Instructor
- **PUT** `/instructors/:id/assign-vehicle`
- Protected: Yes
- Body: `{ vehicleId }` (null to unassign)

---

## Vehicles Endpoints

### Get All Vehicles
- **GET** `/vehicles`
- Protected: Yes
- Query params: `page`, `limit`, `status`, `search`, `sortBy`

### Get Vehicle Count
- **GET** `/vehicles/count`
- Protected: Yes

### Get Single Vehicle
- **GET** `/vehicles/:id`
- Protected: Yes

### Create Vehicle
- **POST** `/vehicles`
- Protected: Yes
- Body: `{ brand, model, licensePlate, status? }`
- Status values: `active`, `maintenance`, `retired`

### Update Vehicle
- **PUT** `/vehicles/:id`
- Protected: Yes

### Delete Vehicle
- **DELETE** `/vehicles/:id`
- Protected: Yes

### Assign Instructor to Vehicle
- **PUT** `/vehicles/:id/assign-instructor`
- Protected: Yes
- Body: `{ instructorId }` (null to unassign)

### Get Maintenance Logs
- **GET** `/vehicles/:id/maintenance-logs`
- Protected: Yes
- Query params: `page`, `limit`

### Add Maintenance Log
- **POST** `/vehicles/:id/maintenance-logs`
- Protected: Yes
- Body: `{ date?, type, description, cost, performedBy? }`
- Type values: `oil-change`, `tire-replacement`, `brake-service`, `inspection`, `repair`, `other`

### Update Maintenance Log
- **PUT** `/vehicles/:id/maintenance-logs/:logId`
- Protected: Yes

---

## Schedule Endpoints

### Get All Schedules
- **GET** `/schedule`
- Protected: Yes
- Query params: `page`, `limit`, `status`, `lessonType`, `candidateId`, `instructorId`, `startDate`, `endDate`, `sortBy`

### Get Upcoming Schedules
- **GET** `/schedule/upcoming`
- Protected: Yes
- Query params: `limit`

### Get Candidate Schedule
- **GET** `/schedule/candidate/:candidateId`
- Protected: Yes

### Get Instructor Schedule
- **GET** `/schedule/instructor/:instructorId`
- Protected: Yes
- Query params: `startDate`, `endDate`

### Get Single Schedule
- **GET** `/schedule/:id`
- Protected: Yes

### Create Schedule
- **POST** `/schedule`
- Protected: Yes
- Body: `{ candidateId, instructorId, date, time, lessonType }`
- Lesson types: `highway_code`, `parking`, `driving`

### Update Schedule
- **PUT** `/schedule/:id`
- Protected: Yes

### Cancel Schedule
- **DELETE** `/schedule/:id`
- Protected: Yes

### Mark as Completed
- **PUT** `/schedule/:id/complete`
- Protected: Yes

---

## Payments Endpoints

### Get All Payments
- **GET** `/payments`
- Protected: Yes
- Query params: `page`, `limit`, `status`, `candidateId`

### Get Pending Payments
- **GET** `/payments/pending`
- Protected: Yes

### Get Pending Payments Count
- **GET** `/payments/pending/count`
- Protected: Yes

### Get Candidate Payments
- **GET** `/payments/candidate/:candidateId`
- Protected: Yes

### Get Single Payment
- **GET** `/payments/:id`
- Protected: Yes

### Create Payment
- **POST** `/payments`
- Protected: Yes
- Body: `{ candidateId, amount, status?, date? }`
- Status values: `pending`, `paid`

### Update Payment
- **PUT** `/payments/:id`
- Protected: Yes

### Delete Payment
- **DELETE** `/payments/:id`
- Protected: Yes

### Mark as Paid
- **PUT** `/payments/:id/mark-paid`
- Protected: Yes

---

## Exams Endpoints

### Get All Exams
- **GET** `/exams`
- Protected: Yes
- Query params: `page`, `limit`, `status`, `examType`, `candidateId`, `instructorId`, `startDate`, `endDate`, `sortBy`

### Get Upcoming Exams
- **GET** `/exams/upcoming`
- Protected: Yes
- Query params: `limit`

### Get Candidate Exams
- **GET** `/exams/candidate/:candidateId`
- Protected: Yes

### Check Can Take Exam (15-day rule)
- **GET** `/exams/can-take/:candidateId/:examType`
- Protected: Yes

### Get Single Exam
- **GET** `/exams/:id`
- Protected: Yes

### Schedule Exam
- **POST** `/exams`
- Protected: Yes
- Body: `{ candidateId, instructorId, examType, date, time, notes? }`
- Exam types: `highway_code`, `parking`, `driving`

### Update Exam
- **PUT** `/exams/:id`
- Protected: Yes

### Record Exam Result
- **PUT** `/exams/:id/result`
- Protected: Yes
- Body: `{ result, notes? }`
- Result values: `passed`, `failed`

### Cancel Exam
- **DELETE** `/exams/:id`
- Protected: Yes

---

## Settings Endpoints

### Get Settings
- **GET** `/settings`
- Protected: Yes

### Update Name
- **PUT** `/settings/name`
- Protected: Yes
- Body: `{ name }`

### Update Email
- **PUT** `/settings/email`
- Protected: Yes
- Body: `{ email, password }`

### Update Password
- **PUT** `/settings/password`
- Protected: Yes
- Body: `{ currentPassword, newPassword }`

---

## Dashboard Endpoint

### Get Dashboard Stats
- **GET** `/dashboard/stats`
- Protected: Yes
- Returns:
  - `totalCandidates`
  - `totalInstructors`
  - `totalVehicles`
  - `pendingPayments` (count and totalAmount)

---

## Business Rules

### Exam 15-Day Waiting Rule
- A candidate must wait 15 days between exam attempts (after passing or failing)
- Use `/exams/can-take/:candidateId/:examType` to check eligibility

### Vehicle-Instructor Assignment
- One instructor can only have one assigned vehicle
- One vehicle can only be assigned to one instructor

### Candidate Progress Flow
1. `highway_code` → 2. `parking` → 3. `driving`
- When a candidate passes an exam, their progress automatically advances to the next phase
- When a candidate passes the `driving` exam, their status becomes `completed`

### Status Values
- **Candidate Status**: `active`, `completed`, `deleted`
- **Instructor Status**: `active`, `deleted`
- **Vehicle Status**: `active`, `maintenance`, `retired`
- **Schedule Status**: `scheduled`, `cancelled`, `completed`
- **Payment Status**: `pending`, `paid`
- **Exam Status**: `scheduled`, `passed`, `failed`, `cancelled`

