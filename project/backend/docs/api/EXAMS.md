# Exams API Documentation

Base URL: `/api/v1/exams`

All endpoints require authentication (include `Authorization: Bearer <token>` header).

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all exams (with filters) |
| GET | `/upcoming` | Get upcoming exams |
| GET | `/candidate/:candidateId` | Get candidate's exams |
| GET | `/can-take/:candidateId/:examType` | Check if candidate can take exam |
| GET | `/:id` | Get single exam by ID |
| POST | `/` | Schedule new exam |
| PUT | `/:id` | Update exam |
| DELETE | `/:id` | Cancel exam |
| PUT | `/:id/result` | Record exam result |

---

## Get All Exams

Retrieve a paginated list of exams with optional filters.

### Request

```http
GET /api/v1/exams?page=1&limit=10&status=scheduled&examType=driving
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| status | string | No | Filter by status (scheduled, passed, failed, cancelled) |
| examType | string | No | Filter by type (highway_code, parking, driving) |
| candidateId | string | No | Filter by candidate ID |
| instructorId | string | No | Filter by instructor ID |

### Response

```json
{
  "success": true,
  "count": 5,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  },
  "data": [
    {
      "_id": "64xyz890...",
      "candidateId": {
        "_id": "64abc123...",
        "name": "Mohammed Ali",
        "email": "mohammed@example.com"
      },
      "instructorId": {
        "_id": "64def456...",
        "name": "Ahmed Instructor"
      },
      "examType": "driving",
      "date": "2024-01-25T00:00:00.000Z",
      "time": "09:00",
      "status": "scheduled",
      "attemptNumber": 1,
      "notes": null
    }
  ]
}
```

---

## Get Upcoming Exams

Get upcoming scheduled exams for dashboard.

### Request

```http
GET /api/v1/exams/upcoming?limit=10
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | number | No | Number of exams to return (default: 10) |

### Response

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "64xyz890...",
      "candidateId": {
        "name": "Mohammed Ali",
        "phone": "0551234567"
      },
      "instructorId": {
        "name": "Ahmed Instructor"
      },
      "examType": "driving",
      "date": "2024-01-25T00:00:00.000Z",
      "time": "09:00",
      "status": "scheduled"
    }
  ]
}
```

---

## Get Candidate Exams

Get all exams for a specific candidate.

### Request

```http
GET /api/v1/exams/candidate/:candidateId
```

### Response

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "64xyz890...",
      "examType": "highway_code",
      "date": "2024-01-10T00:00:00.000Z",
      "time": "10:00",
      "status": "passed",
      "attemptNumber": 1
    },
    {
      "_id": "64xyz891...",
      "examType": "parking",
      "date": "2024-01-20T00:00:00.000Z",
      "time": "14:00",
      "status": "failed",
      "attemptNumber": 1,
      "notes": "Need more practice on parallel parking"
    }
  ]
}
```

---

## Check If Candidate Can Take Exam

Check if a candidate can take a specific exam type (15-day waiting rule after failed attempt).

### Request

```http
GET /api/v1/exams/can-take/:candidateId/:examType
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| candidateId | string | Candidate's MongoDB ObjectId |
| examType | string | highway_code, parking, or driving |

### Response (Can Take)

```json
{
  "success": true,
  "data": {
    "canTake": true
  }
}
```

### Response (Cannot Take - 15-day Rule)

```json
{
  "success": true,
  "data": {
    "canTake": false,
    "reason": "Must wait 15 days between exam attempts. Next available date: 2024-02-05",
    "waitUntil": "2024-02-05T00:00:00.000Z"
  }
}
```

---

## Get Single Exam

Retrieve details of a specific exam by ID.

### Request

```http
GET /api/v1/exams/:id
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64xyz890...",
    "candidateId": {
      "_id": "64abc123...",
      "name": "Mohammed Ali",
      "email": "mohammed@example.com",
      "phone": "0551234567"
    },
    "instructorId": {
      "_id": "64def456...",
      "name": "Ahmed Instructor",
      "email": "ahmed@drivingschool.com"
    },
    "examType": "driving",
    "date": "2024-01-25T00:00:00.000Z",
    "time": "09:00",
    "status": "scheduled",
    "attemptNumber": 1,
    "notes": null
  }
}
```

---

## Schedule Exam

Schedule a new exam for a candidate.

### Request

```http
POST /api/v1/exams
Content-Type: application/json
```

### Request Body

```json
{
  "candidateId": "64abc123...",
  "instructorId": "64def456...",
  "examType": "driving",
  "date": "2024-01-25",
  "time": "09:00",
  "notes": "Final driving test"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| candidateId | string | Candidate's MongoDB ObjectId |
| instructorId | string | Instructor's MongoDB ObjectId |
| examType | string | highway_code, parking, or driving |
| date | date | Exam date (YYYY-MM-DD) |
| time | string | Exam time in HH:MM format |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| notes | string | Notes about the exam (max 500 chars) |

### Exam Types

| Value | Description |
|-------|-------------|
| highway_code | Theory/Highway code exam |
| parking | Parking exam |
| driving | Road driving exam |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64xyz890...",
    "candidateId": "64abc123...",
    "instructorId": "64def456...",
    "examType": "driving",
    "date": "2024-01-25T00:00:00.000Z",
    "time": "09:00",
    "status": "scheduled",
    "attemptNumber": 2,
    "notes": "Final driving test"
  },
  "message": "Exam scheduled successfully"
}
```
**Status Code**: 201

### Error Responses

**15-Day Waiting Rule**
```json
{
  "success": false,
  "error": "Must wait 15 days between exam attempts. Next available date: 2024-02-05"
}
```
**Status Code**: 400

---

## Update Exam

Update an existing scheduled exam.

### Request

```http
PUT /api/v1/exams/:id
Content-Type: application/json
```

### Request Body

```json
{
  "date": "2024-01-26",
  "time": "10:00",
  "notes": "Rescheduled due to weather"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64xyz890...",
    "date": "2024-01-26T00:00:00.000Z",
    "time": "10:00",
    "notes": "Rescheduled due to weather"
  },
  "message": "Exam updated successfully"
}
```

---

## Cancel Exam

Cancel a scheduled exam (sets status to 'cancelled').

### Request

```http
DELETE /api/v1/exams/:id
```

### Response

```json
{
  "success": true,
  "message": "Exam cancelled successfully"
}
```

---

## Record Exam Result

Record the result of an exam (passed or failed).

### Request

```http
PUT /api/v1/exams/:id/result
Content-Type: application/json
```

### Request Body

```json
{
  "result": "passed",
  "notes": "Excellent performance, passed with flying colors"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| result | string | passed or failed |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| notes | string | Notes about the exam result |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64xyz890...",
    "status": "passed",
    "notes": "Excellent performance, passed with flying colors"
  },
  "message": "Exam result recorded successfully"
}
```

---

## Data Model

### Exam Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| candidateId | ObjectId | Yes | Reference to Candidate |
| instructorId | ObjectId | Yes | Reference to Instructor |
| examType | String | Yes | highway_code, parking, driving |
| date | Date | Yes | Exam date |
| time | String | Yes | Time in HH:MM format |
| status | String | No | scheduled, passed, failed, cancelled (default: scheduled) |
| attemptNumber | Number | No | Attempt number for this exam type (default: 1) |
| notes | String | No | Notes (max 500 chars) |

---

## Business Rules

### 15-Day Waiting Rule
- After a failed exam, the candidate must wait 15 days before attempting the same exam type again
- Use the `/can-take/:candidateId/:examType` endpoint to check eligibility

### Attempt Tracking
- Each exam tracks the attempt number for that specific exam type
- First attempt = 1, second attempt = 2, etc.

---

## cURL Examples

### Get All Exams
```bash
curl -X GET "http://localhost:5000/api/v1/exams?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Schedule Exam
```bash
curl -X POST http://localhost:5000/api/v1/exams \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateId": "64abc123...",
    "instructorId": "64def456...",
    "examType": "driving",
    "date": "2024-01-25",
    "time": "09:00"
  }'
```

### Check Can Take Exam
```bash
curl -X GET http://localhost:5000/api/v1/exams/can-take/64abc123.../driving \
  -H "Authorization: Bearer <token>"
```

### Record Result
```bash
curl -X PUT http://localhost:5000/api/v1/exams/64xyz890.../result \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"result": "passed", "notes": "Excellent performance"}'
```

