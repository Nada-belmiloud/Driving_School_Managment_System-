# Candidates API Documentation

Base URL: `/api/v1/candidates`

All endpoints require authentication (include `Authorization: Bearer <token>` header).

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all candidates (with filters) |
| GET | `/count` | Get total candidate count |
| GET | `/:id` | Get single candidate by ID |
| POST | `/` | Create new candidate |
| PUT | `/:id` | Update candidate |
| DELETE | `/:id` | Soft delete candidate |
| PUT | `/:id/progress` | Update candidate progress |

---

## Get All Candidates

Retrieve a paginated list of candidates with optional filters.

### Request

```http
GET /api/v1/candidates?page=1&limit=10&search=john&licenseType=B&status=active
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10, max: 100) |
| search | string | No | Search by name, email, or phone |
| licenseType | string | No | Filter by license type (A1, A2, B, C1, C2, D) |
| status | string | No | Filter by status (active, completed, deleted) |
| progress | string | No | Filter by progress (highway_code, parking, driving) |
| sortBy | string | No | Sort field (default: -registrationDate) |

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
      "_id": "64abc123...",
      "name": "Mohammed Ali",
      "email": "mohammed@example.com",
      "phone": "0551234567",
      "address": "123 Main St, Algiers",
      "licenseType": "B",
      "dateOfBirth": "2000-01-15T00:00:00.000Z",
      "registrationDate": "2024-01-15T10:30:00.000Z",
      "status": "active",
      "progress": "highway_code",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-20T14:15:00.000Z"
    }
  ]
}
```

---

## Get Candidate Count

Get total number of candidates (excluding deleted).

### Request

```http
GET /api/v1/candidates/count
```

### Response

```json
{
  "success": true,
  "data": {
    "total": 150
  }
}
```

---

## Get Single Candidate

Retrieve details of a specific candidate by ID.

### Request

```http
GET /api/v1/candidates/:id
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Candidate ID (MongoDB ObjectId) |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "name": "Mohammed Ali",
    "email": "mohammed@example.com",
    "phone": "0551234567",
    "address": "123 Main St, Algiers",
    "licenseType": "B",
    "dateOfBirth": "2000-01-15T00:00:00.000Z",
    "registrationDate": "2024-01-15T10:30:00.000Z",
    "status": "active",
    "progress": "highway_code",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:15:00.000Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Candidate not found"
}
```
**Status Code**: 404

---

## Create Candidate

Create a new candidate record.

### Request

```http
POST /api/v1/candidates
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Mohammed Ali",
  "email": "mohammed@example.com",
  "phone": "0551234567",
  "address": "123 Main St, Algiers",
  "dateOfBirth": "2000-01-15",
  "licenseType": "B"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| name | string | Candidate's full name (2-100 chars) |
| email | string | Valid email address (unique) |
| phone | string | Phone number (10-15 digits) |
| licenseType | string | License type: A1, A2, B, C1, C2, D |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| address | string | Address (max 200 chars) |
| dateOfBirth | date | Date of birth (must be 16-100 years old) |
| progress | string | Initial progress (default: highway_code) |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "name": "Mohammed Ali",
    "email": "mohammed@example.com",
    "phone": "0551234567",
    "address": "123 Main St, Algiers",
    "licenseType": "B",
    "dateOfBirth": "2000-01-15T00:00:00.000Z",
    "registrationDate": "2024-01-15T10:30:00.000Z",
    "status": "active",
    "progress": "highway_code"
  },
  "message": "Candidate created successfully"
}
```
**Status Code**: 201

### Error Response

**Duplicate Email**
```json
{
  "success": false,
  "error": "Candidate with this email already exists"
}
```
**Status Code**: 400

---

## Update Candidate

Update an existing candidate.

### Request

```http
PUT /api/v1/candidates/:id
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Mohammed Ali Updated",
  "phone": "0559876543",
  "address": "456 New St, Oran"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "name": "Mohammed Ali Updated",
    "email": "mohammed@example.com",
    "phone": "0559876543",
    "address": "456 New St, Oran",
    "licenseType": "B",
    "status": "active",
    "progress": "highway_code"
  },
  "message": "Candidate updated successfully"
}
```

---

## Delete Candidate (Soft Delete)

Soft delete a candidate (sets status to 'deleted').

### Request

```http
DELETE /api/v1/candidates/:id
```

### Response

```json
{
  "success": true,
  "message": "Candidate deleted successfully"
}
```

---

## Update Progress

Update candidate's training progress phase.

### Request

```http
PUT /api/v1/candidates/:id/progress
Content-Type: application/json
```

### Request Body

```json
{
  "progress": "parking"
}
```

### Progress Values

| Value | Description |
|-------|-------------|
| highway_code | Theory/Highway code phase |
| parking | Parking practice phase |
| driving | Road driving phase |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "name": "Mohammed Ali",
    "progress": "parking"
  },
  "message": "Progress updated successfully"
}
```

---

## Data Model

### Candidate Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | Yes | Full name (2-100 chars) |
| email | String | Yes | Unique email address |
| phone | String | Yes | Phone (10-15 digits) |
| address | String | No | Address (max 200 chars) |
| dateOfBirth | Date | No | Must be 16-100 years old |
| licenseType | String | Yes | A1, A2, B, C1, C2, D |
| registrationDate | Date | No | Auto-set to current date |
| status | String | No | active, completed, deleted (default: active) |
| progress | String | No | highway_code, parking, driving (default: highway_code) |

---

## cURL Examples

### Get All Candidates
```bash
curl -X GET "http://localhost:5000/api/v1/candidates?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Create Candidate
```bash
curl -X POST http://localhost:5000/api/v1/candidates \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mohammed Ali",
    "email": "mohammed@example.com",
    "phone": "0551234567",
    "licenseType": "B"
  }'
```

### Update Progress
```bash
curl -X PUT http://localhost:5000/api/v1/candidates/64abc123.../progress \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"progress": "parking"}'
```

