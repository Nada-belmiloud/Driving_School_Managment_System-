# Vehicles API Documentation

Base URL: `/api/v1/vehicles`

All endpoints require authentication (include `Authorization: Bearer <token>` header).

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all vehicles (with filters) |
| GET | `/count` | Get total vehicle count |
| GET | `/:id` | Get single vehicle by ID |
| POST | `/` | Create new vehicle |
| PUT | `/:id` | Update vehicle |
| DELETE | `/:id` | Delete vehicle |
| PUT | `/:id/assign-instructor` | Assign instructor to vehicle |
| GET | `/:id/maintenance-logs` | Get vehicle maintenance logs |
| POST | `/:id/maintenance-logs` | Add maintenance log |
| PUT | `/:id/maintenance-logs/:logId` | Update maintenance log |

---

## Get All Vehicles

Retrieve a paginated list of vehicles with optional filters.

### Request

```http
GET /api/v1/vehicles?page=1&limit=10&status=active&search=clio
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10, max: 100) |
| search | string | No | Search by brand, model, or license plate |
| status | string | No | Filter by status (active, maintenance, retired) |
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
      "_id": "64ghi789...",
      "brand": "Renault",
      "model": "Clio",
      "licensePlate": "12345-123-16",
      "assignedInstructor": {
        "_id": "64def456...",
        "name": "Ahmed Instructor",
        "email": "ahmed@drivingschool.com"
      },
      "status": "active",
      "createdAt": "2024-01-10T00:00:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    }
  ]
}
```

---

## Get Vehicle Count

Get total number of vehicles (excluding retired).

### Request

```http
GET /api/v1/vehicles/count
```

### Response

```json
{
  "success": true,
  "data": {
    "total": 8
  }
}
```

---

## Get Single Vehicle

Retrieve details of a specific vehicle by ID.

### Request

```http
GET /api/v1/vehicles/:id
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64ghi789...",
    "brand": "Renault",
    "model": "Clio",
    "licensePlate": "12345-123-16",
    "assignedInstructor": {
      "_id": "64def456...",
      "name": "Ahmed Instructor",
      "email": "ahmed@drivingschool.com"
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
  "error": "Vehicle not found"
}
```
**Status Code**: 404

---

## Create Vehicle

Create a new vehicle record.

### Request

```http
POST /api/v1/vehicles
Content-Type: application/json
```

### Request Body

```json
{
  "brand": "Renault",
  "model": "Clio",
  "licensePlate": "12345-123-16"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| brand | string | Vehicle brand (e.g., Renault, Peugeot) |
| model | string | Vehicle model (e.g., Clio, 208) |
| licensePlate | string | License plate number (unique) |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| status | string | active, maintenance, retired (default: active) |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64ghi789...",
    "brand": "Renault",
    "model": "Clio",
    "licensePlate": "12345-123-16",
    "status": "active",
    "assignedInstructor": null
  },
  "message": "Vehicle created successfully"
}
```
**Status Code**: 201

### Error Response

**Duplicate License Plate**
```json
{
  "success": false,
  "error": "licensePlate already exists"
}
```
**Status Code**: 400

---

## Update Vehicle

Update an existing vehicle.

### Request

```http
PUT /api/v1/vehicles/:id
Content-Type: application/json
```

### Request Body

```json
{
  "status": "maintenance"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64ghi789...",
    "brand": "Renault",
    "model": "Clio",
    "licensePlate": "12345-123-16",
    "status": "maintenance"
  },
  "message": "Vehicle updated successfully"
}
```

---

## Delete Vehicle

Delete a vehicle (sets status to 'retired').

### Request

```http
DELETE /api/v1/vehicles/:id
```

### Response

```json
{
  "success": true,
  "message": "Vehicle deleted successfully"
}
```

---

## Assign Instructor to Vehicle

Assign or unassign an instructor to/from a vehicle.

### Request

```http
PUT /api/v1/vehicles/:id/assign-instructor
Content-Type: application/json
```

### Request Body

**Assign Instructor:**
```json
{
  "instructorId": "64def456..."
}
```

**Unassign Instructor:**
```json
{
  "instructorId": null
}
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64ghi789...",
    "brand": "Renault",
    "model": "Clio",
    "licensePlate": "12345-123-16",
    "assignedInstructor": {
      "_id": "64def456...",
      "name": "Ahmed Instructor"
    }
  },
  "message": "Instructor assigned successfully"
}
```

---

## Get Maintenance Logs

Get all maintenance logs for a vehicle.

### Request

```http
GET /api/v1/vehicles/:id/maintenance-logs?page=1&limit=10
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |

### Response

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "64mno345...",
      "vehicleId": "64ghi789...",
      "date": "2024-01-15T00:00:00.000Z",
      "type": "oil-change",
      "description": "Regular oil change at 50,000 km",
      "cost": 5000,
      "performedBy": "AutoService Garage"
    }
  ]
}
```

---

## Add Maintenance Log

Add a new maintenance log for a vehicle.

### Request

```http
POST /api/v1/vehicles/:id/maintenance-logs
Content-Type: application/json
```

### Request Body

```json
{
  "date": "2024-01-15",
  "type": "oil-change",
  "description": "Regular oil change at 50,000 km",
  "cost": 5000,
  "performedBy": "AutoService Garage"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| type | string | Type of maintenance |
| description | string | Description of work done |
| cost | number | Cost in local currency |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| date | date | Date of maintenance (default: now) |
| performedBy | string | Who performed the maintenance |

### Maintenance Types

| Value | Description |
|-------|-------------|
| oil-change | Oil change |
| tire-replacement | Tire replacement |
| brake-service | Brake service |
| inspection | Vehicle inspection |
| repair | General repair |
| other | Other maintenance |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64mno345...",
    "vehicleId": "64ghi789...",
    "date": "2024-01-15T00:00:00.000Z",
    "type": "oil-change",
    "description": "Regular oil change at 50,000 km",
    "cost": 5000,
    "performedBy": "AutoService Garage"
  },
  "message": "Maintenance log added successfully"
}
```
**Status Code**: 201

---

## Update Maintenance Log

Update an existing maintenance log.

### Request

```http
PUT /api/v1/vehicles/:id/maintenance-logs/:logId
Content-Type: application/json
```

### Request Body

```json
{
  "cost": 5500,
  "description": "Updated description"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64mno345...",
    "cost": 5500,
    "description": "Updated description"
  },
  "message": "Maintenance log updated successfully"
}
```

---

## Data Model

### Vehicle Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| brand | String | Yes | Vehicle brand |
| model | String | Yes | Vehicle model |
| licensePlate | String | Yes | Unique license plate |
| assignedInstructor | ObjectId | No | Reference to Instructor |
| status | String | No | active, maintenance, retired (default: active) |

### Maintenance Log Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| vehicleId | ObjectId | Yes | Reference to Vehicle |
| date | Date | No | Date of maintenance |
| type | String | Yes | Type of maintenance |
| description | String | Yes | Description of work |
| cost | Number | Yes | Cost (min: 0) |
| performedBy | String | No | Who performed the work |

---

## cURL Examples

### Get All Vehicles
```bash
curl -X GET "http://localhost:5000/api/v1/vehicles?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Create Vehicle
```bash
curl -X POST http://localhost:5000/api/v1/vehicles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "Renault",
    "model": "Clio",
    "licensePlate": "12345-123-16"
  }'
```

### Add Maintenance Log
```bash
curl -X POST http://localhost:5000/api/v1/vehicles/64ghi789.../maintenance-logs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "oil-change",
    "description": "Regular oil change",
    "cost": 5000
  }'
```

