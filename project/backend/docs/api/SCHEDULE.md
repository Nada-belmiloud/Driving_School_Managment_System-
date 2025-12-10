# Schedule API Documentation

Base URL: `/api/v1/schedule`

All endpoints require authentication (include `Authorization: Bearer <token>` header).

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all scheduled sessions |
| GET | `/upcoming` | Get upcoming sessions |
| GET | `/candidate/:candidateId` | Get candidate's schedule |
| GET | `/instructor/:instructorId` | Get instructor's schedule |
| GET | `/:id` | Get single session by ID |
| POST | `/` | Create new session |
| PUT | `/:id` | Update session |
| DELETE | `/:id` | Cancel session |
| PUT | `/:id/complete` | Mark session as completed |

---

## Get All Schedules

Retrieve a paginated list of scheduled sessions with filters.

### Request

```http
GET /api/v1/schedule?page=1&limit=10&status=scheduled&lessonType=driving
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| status | string | No | Filter by status (scheduled, cancelled, completed) |
| lessonType | string | No | Filter by type (highway_code, parking, driving) |
| candidateId | string | No | Filter by candidate ID |
| instructorId | string | No | Filter by instructor ID |
| startDate | string | No | Filter from date (YYYY-MM-DD) |
| endDate | string | No | Filter until date (YYYY-MM-DD) |
| sortBy | string | No | Sort field (default: date time) |

### Response

```json
{
  "success": true,
  "count": 5,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "data": [
    {
      "_id": "64jkl012...",
      "candidateId": {
        "_id": "64abc123...",
        "name": "Mohammed Ali",
        "email": "mohammed@example.com",
        "phone": "0551234567"
      },
      "instructorId": {
        "_id": "64def456...",
        "name": "Ahmed Instructor",
        "email": "ahmed@drivingschool.com",
        "phone": "0559876543"
      },
      "date": "2024-01-20T00:00:00.000Z",
      "time": "10:00",
      "status": "scheduled",
      "lessonType": "driving",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

## Get Upcoming Schedules

Get upcoming scheduled sessions for dashboard.

### Request

```http
GET /api/v1/schedule/upcoming?limit=10
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | number | No | Number of sessions to return (default: 10) |

### Response

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "64jkl012...",
      "candidateId": {
        "name": "Mohammed Ali",
        "phone": "0551234567"
      },
      "instructorId": {
        "name": "Ahmed Instructor"
      },
      "date": "2024-01-20T00:00:00.000Z",
      "time": "10:00",
      "lessonType": "driving",
      "status": "scheduled"
    }
  ]
}
```

---

## Get Candidate Schedule

Get all scheduled sessions for a specific candidate.

### Request

```http
GET /api/v1/schedule/candidate/:candidateId
```

### Response

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "64jkl012...",
      "instructorId": {
        "name": "Ahmed Instructor"
      },
      "date": "2024-01-20T00:00:00.000Z",
      "time": "10:00",
      "lessonType": "driving",
      "status": "scheduled"
    }
  ]
}
```

---

## Get Instructor Schedule

Get all scheduled sessions for a specific instructor.

### Request

```http
GET /api/v1/schedule/instructor/:instructorId?startDate=2024-01-01&endDate=2024-01-31
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | No | Filter from date |
| endDate | string | No | Filter until date |

### Response

```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "64jkl012...",
      "candidateId": {
        "name": "Mohammed Ali",
        "phone": "0551234567"
      },
      "date": "2024-01-20T00:00:00.000Z",
      "time": "10:00",
      "lessonType": "driving",
      "status": "scheduled"
    }
  ]
}
```

---

## Get Single Schedule

Retrieve details of a specific session by ID.

### Request

```http
GET /api/v1/schedule/:id
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64jkl012...",
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
    "date": "2024-01-20T00:00:00.000Z",
    "time": "10:00",
    "status": "scheduled",
    "lessonType": "driving"
  }
}
```

---

## Create Schedule

Schedule a new training session.

### Request

```http
POST /api/v1/schedule
Content-Type: application/json
```

### Request Body

```json
{
  "candidateId": "64abc123...",
  "instructorId": "64def456...",
  "date": "2024-01-25",
  "time": "14:00",
  "lessonType": "driving"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| candidateId | string | Candidate's MongoDB ObjectId |
| instructorId | string | Instructor's MongoDB ObjectId |
| date | date | Session date (YYYY-MM-DD) |
| time | string | Session time in HH:MM format |
| lessonType | string | highway_code, parking, or driving |

### Lesson Types

| Value | Description |
|-------|-------------|
| highway_code | Theory/Highway code session |
| parking | Parking practice session |
| driving | Road driving session |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64jkl012...",
    "candidateId": "64abc123...",
    "instructorId": "64def456...",
    "date": "2024-01-25T00:00:00.000Z",
    "time": "14:00",
    "status": "scheduled",
    "lessonType": "driving"
  },
  "message": "Session scheduled successfully"
}
```
**Status Code**: 201

### Error Responses

**Scheduling Conflict**
```json
{
  "success": false,
  "error": "Instructor already has a session scheduled at this time"
}
```
**Status Code**: 400

---

## Update Schedule

Update an existing scheduled session.

### Request

```http
PUT /api/v1/schedule/:id
Content-Type: application/json
```

### Request Body

```json
{
  "date": "2024-01-26",
  "time": "15:00",
  "lessonType": "parking"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64jkl012...",
    "date": "2024-01-26T00:00:00.000Z",
    "time": "15:00",
    "lessonType": "parking",
    "status": "scheduled"
  },
  "message": "Schedule updated successfully"
}
```

---

## Cancel Schedule

Cancel a scheduled session (sets status to 'cancelled').

### Request

```http
DELETE /api/v1/schedule/:id
```

### Response

```json
{
  "success": true,
  "message": "Session cancelled successfully"
}
```

---

## Mark as Completed

Mark a scheduled session as completed.

### Request

```http
PUT /api/v1/schedule/:id/complete
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64jkl012...",
    "status": "completed"
  },
  "message": "Session marked as completed"
}
```

---

## Data Model

### Schedule Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| candidateId | ObjectId | Yes | Reference to Candidate |
| instructorId | ObjectId | Yes | Reference to Instructor |
| date | Date | Yes | Session date |
| time | String | Yes | Time in HH:MM format |
| status | String | No | scheduled, cancelled, completed (default: scheduled) |
| lessonType | String | Yes | highway_code, parking, driving |

---

## cURL Examples

### Get All Schedules
```bash
curl -X GET "http://localhost:5000/api/v1/schedule?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Create Schedule
```bash
curl -X POST http://localhost:5000/api/v1/schedule \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateId": "64abc123...",
    "instructorId": "64def456...",
    "date": "2024-01-25",
    "time": "14:00",
    "lessonType": "driving"
  }'
```

### Mark as Completed
```bash
curl -X PUT http://localhost:5000/api/v1/schedule/64jkl012.../complete \
  -H "Authorization: Bearer <token>"
```

