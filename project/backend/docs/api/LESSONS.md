# Lessons API Documentation

Base URL: `/api/v1/lessons`

All endpoints require authentication (include `Authorization: Bearer <token>` header).

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all lessons (with filters) |
| GET | `/stats` | Get lesson statistics |
| GET | `/upcoming` | Get upcoming lessons |
| GET | `/calendar` | Get lessons for calendar view |
| GET | `/:id` | Get single lesson by ID |
| POST | `/` | Schedule new lesson |
| POST | `/check-availability` | Check availability |
| POST | `/bulk-schedule` | Bulk schedule lessons |
| PUT | `/:id` | Update lesson |
| PUT | `/:id/complete` | Complete lesson with rating |
| DELETE | `/:id` | Cancel lesson |

---

## Get All Lessons

Retrieve a paginated list of lessons with advanced filtering.

### Request

```http
GET /api/v1/lessons?page=1&limit=10&status=scheduled&studentId=64abc123
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| search | string | No | Search by student, instructor, or vehicle |
| status | string | No | Filter by status |
| lessonType | string | No | Filter by lesson type |
| studentId | string | No | Filter by student ID |
| instructorId | string | No | Filter by instructor ID |
| vehicleId | string | No | Filter by vehicle ID |
| startDate | string | No | Filter lessons from this date |
| endDate | string | No | Filter lessons until this date |
| sortBy | string | No | Sort field (default: date time) |

### Response

```json
{
  "success": true,
  "count": 5,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  },
  "data": [
    {
      "_id": "64jkl012mno345678",
      "studentId": {
        "_id": "64abc123def456789",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "1234567890",
        "licenseType": "B"
      },
      "instructorId": {
        "_id": "64def456abc789012",
        "name": "Michael Smith",
        "email": "michael@drivingschool.com",
        "experienceYears": 8,
        "phone": "9876543210"
      },
      "vehicleId": {
        "_id": "64ghi789jkl012345",
        "plateNumber": "ABC-1234",
        "model": "Corolla",
        "year": 2020,
        "transmission": "automatic",
        "fuelType": "petrol"
      },
      "date": "2024-01-20T00:00:00.000Z",
      "time": "10:00",
      "duration": 60,
      "status": "scheduled",
      "lessonType": "practical",
      "location": "Student home -> City center",
      "notes": "Focus on parallel parking",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

## Get Lesson Statistics

Retrieve comprehensive statistics about lessons.

### Request

```http
GET /api/v1/lessons/stats
```

### Response

```json
{
  "success": true,
  "data": {
    "total": 1250,
    "scheduled": 45,
    "completed": 1150,
    "cancelled": 35,
    "noShow": 15,
    "inProgress": 5,
    "upcoming": 28,
    "todayLessons": 12,
    "byStatus": [
      { "_id": "completed", "count": 1150 },
      { "_id": "scheduled", "count": 45 },
      { "_id": "cancelled", "count": 35 }
    ],
    "byType": [
      { "_id": "practical", "count": 900 },
      { "_id": "theory", "count": 250 },
      { "_id": "test-preparation", "count": 75 }
    ],
    "avgDuration": 62,
    "completionRate": 92.0
  }
}
```

---

## Get Upcoming Lessons

Get upcoming scheduled lessons for dashboard.

### Request

```http
GET /api/v1/lessons/upcoming?limit=10
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | number | No | Number of lessons to return (default: 10) |

### Response

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "64jkl012mno345678",
      "studentId": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "1234567890"
      },
      "instructorId": {
        "name": "Michael Smith"
      },
      "vehicleId": {
        "plateNumber": "ABC-1234",
        "model": "Corolla"
      },
      "date": "2024-01-20T00:00:00.000Z",
      "time": "10:00",
      "duration": 60,
      "status": "scheduled",
      "lessonType": "practical"
    }
  ]
}
```

---

## Get Calendar Lessons

Get all lessons for a specific month (calendar view).

### Request

```http
GET /api/v1/lessons/calendar?year=2024&month=1
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| year | number | Yes | Year (e.g., 2024) |
| month | number | Yes | Month (1-12) |

### Response

```json
{
  "success": true,
  "data": [
    {
      "_id": "64jkl012mno345678",
      "studentId": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "1234567890"
      },
      "instructorId": {
        "name": "Michael Smith"
      },
      "vehicleId": {
        "plateNumber": "ABC-1234",
        "model": "Corolla"
      },
      "date": "2024-01-20T00:00:00.000Z",
      "time": "10:00",
      "duration": 60,
      "status": "scheduled",
      "lessonType": "practical"
    }
  ]
}
```

---

## Get Single Lesson

Retrieve details of a specific lesson by ID.

### Request

```http
GET /api/v1/lessons/:id
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Lesson ID (MongoDB ObjectId) |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64jkl012mno345678",
    "studentId": {
      "_id": "64abc123def456789",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "licenseType": "B"
    },
    "instructorId": {
      "_id": "64def456abc789012",
      "name": "Michael Smith",
      "email": "michael@drivingschool.com",
      "experienceYears": 8
    },
    "vehicleId": {
      "_id": "64ghi789jkl012345",
      "plateNumber": "ABC-1234",
      "model": "Corolla",
      "year": 2020
    },
    "date": "2024-01-20T00:00:00.000Z",
    "time": "10:00",
    "duration": 60,
    "status": "completed",
    "lessonType": "practical",
    "location": "Student home -> City center -> Highway",
    "notes": "Great lesson! Student mastered parallel parking.",
    "rating": 5,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-20T11:05:00.000Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Lesson not found"
}
```

**Status Code**: 404

---

## Schedule New Lesson

Create a new lesson with conflict checking.

### Request

```http
POST /api/v1/lessons
Content-Type: application/json
```

### Request Body

```json
{
  "studentId": "64abc123def456789",
  "instructorId": "64def456abc789012",
  "vehicleId": "64ghi789jkl012345",
  "date": "2024-01-20",
  "time": "10:00",
  "duration": 60,
  "lessonType": "practical",
  "location": "Student home -> City center",
  "notes": "First practical lesson"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| studentId | string | Student ID |
| instructorId | string | Instructor ID |
| vehicleId | string | Vehicle ID |
| date | date | Lesson date (YYYY-MM-DD) |
| time | string | Start time (HH:MM format) |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| duration | number | Duration in minutes (default: 60) |
| lessonType | string | theory, practical, test-preparation, or road-test |
| location | string | Pickup/lesson location |
| notes | string | Additional notes (max 500 chars) |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64jkl012mno345678",
    "studentId": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "instructorId": {
      "name": "Michael Smith",
      "email": "michael@drivingschool.com"
    },
    "vehicleId": {
      "plateNumber": "ABC-1234",
      "model": "Corolla"
    },
    "date": "2024-01-20T00:00:00.000Z",
    "time": "10:00",
    "duration": 60,
    "status": "scheduled",
    "lessonType": "practical",
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  "message": "Lesson scheduled successfully"
}
```

**Status Code**: 201

### Error Responses

**Schedule Conflict**
```json
{
  "success": false,
  "error": "Instructor Michael Smith is already scheduled at this time"
}
```

**Vehicle Unavailable**
```json
{
  "success": false,
  "error": "Vehicle is maintenance"
}
```

**Entity Not Found**
```json
{
  "success": false,
  "error": "Student not found"
}
```

---

## Check Availability

Check if instructor and vehicle are available for scheduling.

### Request

```http
POST /api/v1/lessons/check-availability
Content-Type: application/json
```

### Request Body

```json
{
  "instructorId": "64def456abc789012",
  "vehicleId": "64ghi789jkl012345",
  "date": "2024-01-20",
  "time": "10:00"
}
```

### Response

**Available**
```json
{
  "success": true,
  "data": {
    "available": true,
    "conflicts": []
  }
}
```

**Conflicts Found**
```json
{
  "success": true,
  "data": {
    "available": false,
    "conflicts": [
      {
        "time": "10:00",
        "instructor": "Michael Smith",
        "studentWith": "Jane Doe"
      }
    ]
  }
}
```

---

## Bulk Schedule Lessons

Schedule multiple lessons at once.

### Request

```http
POST /api/v1/lessons/bulk-schedule
Content-Type: application/json
```

### Request Body

```json
{
  "lessons": [
    {
      "studentId": "64abc123def456789",
      "instructorId": "64def456abc789012",
      "vehicleId": "64ghi789jkl012345",
      "date": "2024-01-20",
      "time": "10:00",
      "duration": 60,
      "lessonType": "practical"
    },
    {
      "studentId": "64abc123def456789",
      "instructorId": "64def456abc789012",
      "vehicleId": "64ghi789jkl012345",
      "date": "2024-01-22",
      "time": "14:00",
      "duration": 60,
      "lessonType": "practical"
    }
  ]
}
```

### Response

```json
{
  "success": true,
  "data": {
    "created": [
      {
        "_id": "64jkl012mno345678",
        "studentId": { "name": "John Doe" },
        "date": "2024-01-20T00:00:00.000Z",
        "time": "10:00"
      }
    ],
    "errors": [
      {
        "index": 1,
        "error": "Schedule conflict detected"
      }
    ],
    "summary": {
      "total": 2,
      "successful": 1,
      "failed": 1
    }
  },
  "message": "1 lessons scheduled successfully, 1 failed"
}
```

---

## Update Lesson

Update an existing lesson's information.

### Request

```http
PUT /api/v1/lessons/:id
Content-Type: application/json
```

### Request Body

```json
{
  "date": "2024-01-21",
  "time": "14:00",
  "notes": "Rescheduled - student request"
}
```

**Note**: Only include fields you want to update. Changing time/date/instructor/vehicle triggers conflict checking.

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64jkl012mno345678",
    "studentId": { "name": "John Doe" },
    "instructorId": { "name": "Michael Smith" },
    "vehicleId": { "plateNumber": "ABC-1234" },
    "date": "2024-01-21T00:00:00.000Z",
    "time": "14:00",
    "notes": "Rescheduled - student request",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  },
  "message": "Lesson updated successfully"
}
```

---

## Complete Lesson

Mark a lesson as completed with optional rating and notes.

### Request

```http
PUT /api/v1/lessons/:id/complete
Content-Type: application/json
```

### Request Body

```json
{
  "rating": 5,
  "notes": "Excellent lesson! Student showed great improvement in highway driving."
}
```

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| rating | number | Rating 1-5 stars |
| notes | string | Lesson feedback/notes |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64jkl012mno345678",
    "studentId": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890"
    },
    "instructorId": {
      "name": "Michael Smith",
      "email": "michael@drivingschool.com"
    },
    "vehicleId": {
      "plateNumber": "ABC-1234",
      "model": "Corolla"
    },
    "date": "2024-01-20T00:00:00.000Z",
    "time": "10:00",
    "status": "completed",
    "rating": 5,
    "notes": "Excellent lesson! Student showed great improvement in highway driving.",
    "updatedAt": "2024-01-20T11:05:00.000Z"
  },
  "message": "Lesson marked as completed"
}
```

**Note**: Completing a lesson automatically updates the student's progress (theory or practical lesson count).

### Error Response

```json
{
  "success": false,
  "error": "Only scheduled or in-progress lessons can be completed"
}
```

---

## Cancel Lesson

Cancel a scheduled lesson.

### Request

```http
DELETE /api/v1/lessons/:id
```

### Response

```json
{
  "success": true,
  "data": {},
  "message": "Lesson cancelled successfully"
}
```

**Note**: This sets the status to 'cancelled' rather than deleting the record.

---

## Data Models

### Lesson Object

```typescript
{
  _id: string,
  studentId: string | Student,
  instructorId: string | Instructor,
  vehicleId: string | Vehicle,
  date: Date,
  time: string,
  duration: number,
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show',
  lessonType: 'theory' | 'practical' | 'test-preparation' | 'road-test',
  location?: string,
  notes?: string,
  rating?: number,
  cancellationReason?: string,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Validation Rules

### Student ID, Instructor ID, Vehicle ID
- Required
- Must be valid MongoDB ObjectId
- Entity must exist in database

### Date
- Required
- Cannot be more than 1 year in the past

### Time
- Required
- Format: HH:MM (24-hour)
- Example: "10:00", "14:30"

### Duration
- Range: 30-180 minutes
- Default: 60 minutes

### Status
- One of: scheduled, in-progress, completed, cancelled, no-show
- Default: scheduled

### Lesson Type
- One of: theory, practical, test-preparation, road-test
- Default: practical

### Rating
- Range: 1-5
- Only for completed lessons

---

## Business Rules

### Conflict Prevention
- One instructor cannot have two lessons at the same time
- One vehicle cannot be used for two lessons at the same time
- System automatically checks for conflicts before scheduling

### Status Transitions
- scheduled → in-progress → completed ✓
- scheduled → cancelled ✓
- in-progress → completed ✓
- completed → [no changes allowed]

### Student Progress Updates
- Completing a theory lesson increments `student.progress.theoryLessons`
- Completing a practical/test-prep lesson increments `student.progress.practicalLessons`

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid data, validation error, or conflict |
| 401 | Unauthorized | Missing or invalid token |
| 404 | Not Found | Lesson, student, instructor, or vehicle not found |
| 500 | Server Error | Internal server error |

---

## Related Endpoints

- [Students API](./STUDENTS.md) - Students taking lessons
- [Instructors API](./INSTRUCTORS.md) - Instructors teaching lessons
- [Vehicles API](./VEHICLES.md) - Vehicles used in lessons
- [Payments API](./PAYMENTS.md) - Payments for lessons

---

For more examples and use cases, see the [Frontend Guide](../guides/FRONTEND_GUIDE.md).