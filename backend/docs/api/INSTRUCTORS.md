# Instructors API Documentation

Base URL: `/api/v1/instructors`

All endpoints require authentication (include `Authorization: Bearer <token>` header).

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all instructors (with filters) |
| GET | `/stats` | Get instructor statistics |
| GET | `/:id` | Get single instructor by ID |
| GET | `/:id/schedule` | Get instructor schedule |
| POST | `/` | Create new instructor |
| PUT | `/:id` | Update instructor |
| DELETE | `/:id` | Delete instructor |

---

## Get All Instructors

Retrieve a paginated list of instructors with optional filters.

### Request

```http
GET /api/v1/instructors?page=1&limit=10&status=active&search=john
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10, max: 100) |
| search | string | No | Search by name, email, or phone |
| status | string | No | Filter by status (active, inactive, on-leave, terminated) |
| sortBy | string | No | Sort field (default: -createdAt) |

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
      "_id": "64def456abc789012",
      "name": "Michael Smith",
      "email": "michael@drivingschool.com",
      "phone": "9876543210",
      "licenseNumber": "INS-12345-NY",
      "experienceYears": 8,
      "specialization": "both",
      "status": "active",
      "hireDate": "2020-03-15T00:00:00.000Z",
      "availability": {
        "monday": true,
        "tuesday": true,
        "wednesday": true,
        "thursday": true,
        "friday": true,
        "saturday": false,
        "sunday": false
      },
      "stats": {
        "totalLessons": 245,
        "completedLessons": 220,
        "avgRating": 4.5,
        "totalReviews": 171
      },
      "createdAt": "2020-03-15T00:00:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    }
  ]
}
```

---

## Get Instructor Statistics

Retrieve statistics about instructors.

### Request

```http
GET /api/v1/instructors/stats
```

### Response

```json
{
  "success": true,
  "data": {
    "total": 25,
    "active": 20,
    "inactive": 3,
    "onLeave": 2,
    "avgExperience": 6,
    "totalLessons": 5432
  }
}
```

---

## Get Single Instructor

Retrieve details of a specific instructor by ID.

### Request

```http
GET /api/v1/instructors/:id
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Instructor ID (MongoDB ObjectId) |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64def456abc789012",
    "name": "Michael Smith",
    "email": "michael@drivingschool.com",
    "phone": "9876543210",
    "licenseNumber": "INS-12345-NY",
    "experienceYears": 8,
    "specialization": "both",
    "dateOfBirth": "1985-05-20T00:00:00.000Z",
    "hireDate": "2020-03-15T00:00:00.000Z",
    "status": "active",
    "availability": {
      "monday": true,
      "tuesday": true,
      "wednesday": true,
      "thursday": true,
      "friday": true,
      "saturday": false,
      "sunday": false
    },
    "emergencyContact": "Jane Smith (Wife)",
    "emergencyPhone": "9876543211",
    "notes": "Excellent with nervous students",
    "stats": {
      "totalLessons": 245,
      "completedLessons": 220,
      "avgRating": 4.5,
      "totalReviews": 171
    },
    "createdAt": "2020-03-15T00:00:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Instructor not found"
}
```

**Status Code**: 404

---

## Get Instructor Schedule

Get scheduled lessons for a specific instructor.

### Request

```http
GET /api/v1/instructors/:id/schedule?startDate=2024-01-15&endDate=2024-01-21
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Instructor ID |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | No | Start date (YYYY-MM-DD) |
| endDate | string | No | End date (YYYY-MM-DD) |

### Response

```json
{
  "success": true,
  "data": [
    {
      "_id": "64jkl012mno345678",
      "studentId": {
        "_id": "64abc123def456789",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "vehicleId": {
        "_id": "64ghi789jkl012345",
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

## Create Instructor

Create a new instructor record.

### Request

```http
POST /api/v1/instructors
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Michael Smith",
  "email": "michael@drivingschool.com",
  "phone": "9876543210",
  "licenseNumber": "INS-12345-NY",
  "experienceYears": 8,
  "specialization": "both",
  "dateOfBirth": "1985-05-20",
  "availability": {
    "monday": true,
    "tuesday": true,
    "wednesday": true,
    "thursday": true,
    "friday": true,
    "saturday": false,
    "sunday": false
  },
  "emergencyContact": "Jane Smith (Wife)",
  "emergencyPhone": "9876543211",
  "notes": "Excellent with nervous students"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| name | string | Instructor's full name (min 2 chars) |
| email | string | Valid email address (unique) |
| phone | string | Phone number (10-15 digits) |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| licenseNumber | string | Professional license number |
| experienceYears | number | Years of experience (0-50) |
| specialization | string | "manual", "automatic", or "both" |
| dateOfBirth | date | Birth date (age 21-75) |
| availability | object | Weekly availability schedule |
| emergencyContact | string | Emergency contact name |
| emergencyPhone | string | Emergency phone (10-15 digits) |
| notes | string | Additional notes (max 500 chars) |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64def456abc789012",
    "name": "Michael Smith",
    "email": "michael@drivingschool.com",
    "phone": "9876543210",
    "licenseNumber": "INS-12345-NY",
    "experienceYears": 8,
    "specialization": "both",
    "status": "active",
    "hireDate": "2024-01-15T00:00:00.000Z",
    "availability": {
      "monday": true,
      "tuesday": true,
      "wednesday": true,
      "thursday": true,
      "friday": true,
      "saturday": false,
      "sunday": false
    },
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  },
  "message": "Instructor created successfully"
}
```

**Status Code**: 201

### Error Responses

**Duplicate Email**
```json
{
  "success": false,
  "error": "Instructor with this email already exists"
}
```
**Status Code**: 400

---

## Update Instructor

Update an existing instructor's information.

### Request

```http
PUT /api/v1/instructors/:id
Content-Type: application/json
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Instructor ID |

### Request Body

```json
{
  "phone": "1112223333",
  "status": "on-leave",
  "notes": "On vacation until March 1st"
}
```

**Note**: Only include fields you want to update. All fields are optional.

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64def456abc789012",
    "name": "Michael Smith",
    "email": "michael@drivingschool.com",
    "phone": "1112223333",
    "status": "on-leave",
    "notes": "On vacation until March 1st",
    "updatedAt": "2024-01-20T14:15:00.000Z"
  },
  "message": "Instructor updated successfully"
}
```

### Error Response

**Instructor Not Found**
```json
{
  "success": false,
  "error": "Instructor not found"
}
```
**Status Code**: 404

---

## Delete Instructor

Delete an instructor record.

**Warning**: Cannot delete instructors with scheduled lessons.

### Request

```http
DELETE /api/v1/instructors/:id
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Instructor ID |

### Response

```json
{
  "success": true,
  "data": {},
  "message": "Instructor deleted successfully"
}
```

**Status Code**: 200

### Error Responses

**Has Scheduled Lessons**
```json
{
  "success": false,
  "error": "Cannot delete instructor with scheduled lessons"
}
```
**Status Code**: 400

**Instructor Not Found**
```json
{
  "success": false,
  "error": "Instructor not found"
}
```
**Status Code**: 404

---

## Data Models

### Instructor Object

```typescript
{
  _id: string,
  name: string,
  email: string,
  phone: string,
  licenseNumber?: string,
  experienceYears: number,
  specialization: 'manual' | 'automatic' | 'both',
  dateOfBirth?: Date,
  hireDate: Date,
  status: 'active' | 'inactive' | 'on-leave' | 'terminated',
  availability: {
    monday: boolean,
    tuesday: boolean,
    wednesday: boolean,
    thursday: boolean,
    friday: boolean,
    saturday: boolean,
    sunday: boolean
  },
  emergencyContact?: string,
  emergencyPhone?: string,
  notes?: string,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Validation Rules

### Name
- Required
- Minimum 2 characters
- Maximum 100 characters

### Email
- Required
- Must be valid email format
- Must be unique
- Case-insensitive

### Phone
- Required
- Must be 10-15 digits
- Numbers only

### Experience Years
- Optional
- Range: 0-50 years

### Specialization
- One of: "manual", "automatic", "both"
- Default: "both"

### Date of Birth
- Optional
- Age must be between 21 and 75 years

### Status
- One of: active, inactive, on-leave, terminated
- Default: active

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid data or validation error |
| 401 | Unauthorized | Missing or invalid token |
| 404 | Not Found | Instructor doesn't exist |
| 409 | Conflict | Duplicate email |
| 500 | Server Error | Internal server error |

---

## Related Endpoints

- [Lessons API](./LESSONS.md) - Schedule lessons for instructors
- [Vehicles API](./VEHICLES.md) - Vehicles used by instructors
- [Authentication API](./AUTH.md) - Login and authentication

---

## CURL Examples

### Get All Instructors
```bash
curl -X GET "http://localhost:5000/api/v1/instructors?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Instructor
```bash
curl -X POST http://localhost:5000/api/v1/instructors \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Michael Smith",
    "email": "michael@drivingschool.com",
    "phone": "9876543210",
    "licenseNumber": "INS-12345-NY",
    "experienceYears": 8,
    "specialization": "both"
  }'
```

### Get Instructor Schedule
```bash
curl -X GET "http://localhost:5000/api/v1/instructors/64def456abc789012/schedule?startDate=2024-01-15&endDate=2024-01-21" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Instructor
```bash
curl -X PUT http://localhost:5000/api/v1/instructors/64def456abc789012 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "on-leave",
    "notes": "On vacation"
  }'
```

### Delete Instructor
```bash
curl -X DELETE http://localhost:5000/api/v1/instructors/64def456abc789012 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

For more examples and use cases, see the [Frontend Guide](../guides/FRONTEND_GUIDE.md).