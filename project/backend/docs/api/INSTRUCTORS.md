# Instructors API Documentation

Base URL: `/api/v1/instructors`

All endpoints require authentication (include `Authorization: Bearer <token>` header).

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all instructors (with filters) |
| GET | `/count` | Get total instructor count |
| GET | `/:id` | Get single instructor by ID |
| POST | `/` | Create new instructor |
| PUT | `/:id` | Update instructor |
| DELETE | `/:id` | Soft delete instructor |
| PUT | `/:id/assign-vehicle` | Assign vehicle to instructor |

---

## Get All Instructors

Retrieve a paginated list of instructors with optional filters.

### Request

```http
GET /api/v1/instructors?page=1&limit=10&status=active&search=ahmed
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10, max: 100) |
| search | string | No | Search by name or email |
| status | string | No | Filter by status (active, deleted) |
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
      "_id": "64def456...",
      "name": "Ahmed Instructor",
      "email": "ahmed@drivingschool.com",
      "phone": "0559876543",
      "address": "456 Instructor St, Algiers",
      "assignedVehicle": {
        "_id": "64ghi789...",
        "brand": "Renault",
        "model": "Clio",
        "licensePlate": "12345-123-16"
      },
      "status": "active",
      "createdAt": "2024-01-10T00:00:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    }
  ]
}
```

---

## Get Instructor Count

Get total number of instructors (excluding deleted).

### Request

```http
GET /api/v1/instructors/count
```

### Response

```json
{
  "success": true,
  "data": {
    "total": 12
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
    "_id": "64def456...",
    "name": "Ahmed Instructor",
    "email": "ahmed@drivingschool.com",
    "phone": "0559876543",
    "address": "456 Instructor St, Algiers",
    "assignedVehicle": {
      "_id": "64ghi789...",
      "brand": "Renault",
      "model": "Clio",
      "licensePlate": "12345-123-16"
    },
    "status": "active",
    "createdAt": "2024-01-10T00:00:00.000Z",
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
  "name": "Ahmed Instructor",
  "email": "ahmed@drivingschool.com",
  "phone": "0559876543",
  "address": "456 Instructor St, Algiers"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| name | string | Instructor's full name (2-100 chars) |
| email | string | Valid email address (unique) |
| phone | string | Phone number (10-15 digits) |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| address | string | Address (max 200 chars) |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64def456...",
    "name": "Ahmed Instructor",
    "email": "ahmed@drivingschool.com",
    "phone": "0559876543",
    "address": "456 Instructor St, Algiers",
    "status": "active",
    "assignedVehicle": null
  },
  "message": "Instructor created successfully"
}
```
**Status Code**: 201

### Error Response

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

Update an existing instructor.

### Request

```http
PUT /api/v1/instructors/:id
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Ahmed Instructor Updated",
  "phone": "0551112233"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64def456...",
    "name": "Ahmed Instructor Updated",
    "email": "ahmed@drivingschool.com",
    "phone": "0551112233",
    "status": "active"
  },
  "message": "Instructor updated successfully"
}
```

---

## Delete Instructor (Soft Delete)

Soft delete an instructor (sets status to 'deleted').

### Request

```http
DELETE /api/v1/instructors/:id
```

### Response

```json
{
  "success": true,
  "message": "Instructor deleted successfully"
}
```

---

## Assign Vehicle to Instructor

Assign or unassign a vehicle to/from an instructor.

### Request

```http
PUT /api/v1/instructors/:id/assign-vehicle
Content-Type: application/json
```

### Request Body

**Assign Vehicle:**
```json
{
  "vehicleId": "64ghi789..."
}
```

**Unassign Vehicle:**
```json
{
  "vehicleId": null
}
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64def456...",
    "name": "Ahmed Instructor",
    "assignedVehicle": {
      "_id": "64ghi789...",
      "brand": "Renault",
      "model": "Clio",
      "licensePlate": "12345-123-16"
    }
  },
  "message": "Vehicle assigned successfully"
}
```

### Error Response

**Vehicle Not Found**
```json
{
  "success": false,
  "error": "Vehicle not found"
}
```
**Status Code**: 404

**Vehicle Already Assigned**
```json
{
  "success": false,
  "error": "Vehicle is already assigned to another instructor"
}
```
**Status Code**: 400

---

## Data Model

### Instructor Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | Yes | Full name (2-100 chars) |
| email | String | Yes | Unique email address |
| phone | String | Yes | Phone (10-15 digits) |
| address | String | No | Address (max 200 chars) |
| assignedVehicle | ObjectId | No | Reference to Vehicle |
| status | String | No | active, deleted (default: active) |

---

## cURL Examples

### Get All Instructors
```bash
curl -X GET "http://localhost:5000/api/v1/instructors?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Create Instructor
```bash
curl -X POST http://localhost:5000/api/v1/instructors \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed Instructor",
    "email": "ahmed@drivingschool.com",
    "phone": "0559876543"
  }'
```

### Assign Vehicle
```bash
curl -X PUT http://localhost:5000/api/v1/instructors/64def456.../assign-vehicle \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"vehicleId": "64ghi789..."}'
```

