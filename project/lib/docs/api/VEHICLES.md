# Vehicles API Documentation

Base URL: `/api/v1/vehicles`

All endpoints require authentication (include `Authorization: Bearer <token>` header).

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all vehicles (with filters) |
| GET | `/stats` | Get vehicle statistics |
| GET | `/:id` | Get single vehicle by ID |
| GET | `/:id/availability` | Check vehicle availability |
| GET | `/:id/maintenance` | Get maintenance history |
| POST | `/` | Create new vehicle |
| POST | `/:id/maintenance` | Add maintenance record |
| PUT | `/:id` | Update vehicle |
| PUT | `/:id/maintenance/:maintenanceId` | Update maintenance record |
| PATCH | `/:id/mileage` | Update vehicle mileage |
| DELETE | `/:id` | Delete vehicle |
| DELETE | `/:id/maintenance/:maintenanceId` | Delete maintenance record |

---

## Get All Vehicles

Retrieve a paginated list of vehicles with optional filters.

### Request

```http
GET /api/v1/vehicles?page=1&limit=10&status=available&transmission=automatic
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| search | string | No | Search by plate, model, or manufacturer |
| status | string | No | Filter by status |
| transmission | string | No | Filter by transmission (manual/automatic) |
| fuelType | string | No | Filter by fuel type |
| minYear | number | No | Minimum year |
| maxYear | number | No | Maximum year |
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
      "_id": "64ghi789jkl012345",
      "plateNumber": "ABC-1234",
      "model": "Corolla",
      "manufacturer": "Toyota",
      "year": 2020,
      "color": "silver",
      "vin": "1HGBH41JXMN109186",
      "status": "available",
      "mileage": 45000,
      "fuelType": "petrol",
      "transmission": "automatic",
      "lastMaintenance": "2024-01-15T00:00:00.000Z",
      "nextMaintenanceDate": "2024-04-15T00:00:00.000Z",
      "nextMaintenanceMileage": 50000,
      "stats": {
        "totalLessons": 128,
        "completedLessons": 115,
        "scheduledLessons": 3,
        "maintenanceDue": false
      },
      "createdAt": "2019-06-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

## Get Vehicle Statistics

Retrieve statistics about vehicles.

### Request

```http
GET /api/v1/vehicles/stats
```

### Response

```json
{
  "success": true,
  "data": {
    "total": 15,
    "available": 10,
    "inUse": 2,
    "maintenance": 2,
    "retired": 1,
    "needingMaintenance": 3,
    "avgAge": 4,
    "totalMaintenanceCost": 15430.50,
    "byYear": [
      { "_id": 2022, "count": 3 },
      { "_id": 2021, "count": 5 },
      { "_id": 2020, "count": 4 }
    ],
    "byTransmission": [
      { "_id": "automatic", "count": 10 },
      { "_id": "manual", "count": 5 }
    ],
    "byFuelType": [
      { "_id": "petrol", "count": 8 },
      { "_id": "diesel", "count": 5 },
      { "_id": "hybrid", "count": 2 }
    ]
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

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Vehicle ID (MongoDB ObjectId) |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64ghi789jkl012345",
    "plateNumber": "ABC-1234",
    "model": "Corolla",
    "manufacturer": "Toyota",
    "year": 2020,
    "color": "silver",
    "vin": "1HGBH41JXMN109186",
    "status": "available",
    "mileage": 45000,
    "fuelType": "petrol",
    "transmission": "automatic",
    "lastMaintenance": "2024-01-15T00:00:00.000Z",
    "nextMaintenanceDate": "2024-04-15T00:00:00.000Z",
    "nextMaintenanceMileage": 50000,
    "maintenanceHistory": [
      {
        "_id": "64xyz789abc012345",
        "date": "2024-01-15T00:00:00.000Z",
        "type": "oil-change",
        "description": "Regular oil change",
        "cost": 75.50,
        "performedBy": "ABC Auto Shop",
        "mileageAtService": 45000
      }
    ],
    "insuranceDetails": {
      "provider": "State Farm",
      "policyNumber": "POL-123456",
      "expiryDate": "2025-01-01T00:00:00.000Z",
      "coverage": "comprehensive"
    },
    "stats": {
      "totalLessons": 128,
      "completedLessons": 115,
      "scheduledLessons": 3
    },
    "upcomingLessons": [
      {
        "_id": "64jkl012mno345678",
        "studentId": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "instructorId": {
          "name": "Michael Smith"
        },
        "date": "2024-01-20T00:00:00.000Z",
        "time": "10:00",
        "status": "scheduled"
      }
    ],
    "createdAt": "2019-06-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
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

## Check Vehicle Availability

Check if a vehicle is available for a specific date/time.

### Request

```http
GET /api/v1/vehicles/:id/availability?date=2024-01-20
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Vehicle ID |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| date | string | Yes* | Specific date (YYYY-MM-DD) |
| startDate | string | Yes* | Start date for range |
| endDate | string | Yes* | End date for range |

*Either `date` OR (`startDate` AND `endDate`) required

### Response

```json
{
  "success": true,
  "data": {
    "vehicle": {
      "id": "64ghi789jkl012345",
      "plateNumber": "ABC-1234",
      "model": "Corolla",
      "status": "available"
    },
    "dateRange": {
      "startDate": "2024-01-20",
      "endDate": "2024-01-20"
    },
    "isAvailable": true,
    "scheduledLessons": []
  }
}
```

---

## Get Maintenance History

Get complete maintenance history for a vehicle.

### Request

```http
GET /api/v1/vehicles/:id/maintenance
```

### Response

```json
{
  "success": true,
  "data": {
    "vehicle": {
      "plateNumber": "ABC-1234",
      "model": "Corolla",
      "currentMileage": 45000
    },
    "totalMaintenanceCost": 1250.75,
    "lastMaintenance": "2024-01-15T00:00:00.000Z",
    "nextMaintenanceDate": "2024-04-15T00:00:00.000Z",
    "nextMaintenanceMileage": 50000,
    "maintenanceDue": false,
    "maintenanceHistory": [
      {
        "_id": "64xyz789abc012345",
        "date": "2024-01-15T00:00:00.000Z",
        "type": "oil-change",
        "description": "Regular oil change and filter replacement",
        "cost": 75.50,
        "performedBy": "ABC Auto Shop",
        "mileageAtService": 45000,
        "notes": "All fluids checked"
      },
      {
        "_id": "64xyz789abc012346",
        "date": "2023-10-10T00:00:00.000Z",
        "type": "tire-replacement",
        "description": "Replaced all four tires",
        "cost": 450.00,
        "performedBy": "Tire Center",
        "mileageAtService": 42000,
        "parts": [
          {
            "name": "Michelin Tire",
            "quantity": 4,
            "cost": 450.00
          }
        ]
      }
    ]
  }
}
```

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
  "plateNumber": "ABC-1234",
  "model": "Corolla",
  "manufacturer": "Toyota",
  "year": 2020,
  "color": "silver",
  "vin": "1HGBH41JXMN109186",
  "mileage": 45000,
  "fuelType": "petrol",
  "transmission": "automatic",
  "insuranceDetails": {
    "provider": "State Farm",
    "policyNumber": "POL-123456",
    "expiryDate": "2025-01-01",
    "coverage": "comprehensive"
  }
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| plateNumber | string | License plate (unique) |
| model | string | Vehicle model |
| year | number | Manufacturing year (1990-current+1) |
| fuelType | string | petrol, diesel, electric, or hybrid |
| transmission | string | manual or automatic |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| manufacturer | string | Vehicle manufacturer |
| color | string | Vehicle color |
| vin | string | Vehicle Identification Number (17 chars, unique) |
| mileage | number | Current mileage (default: 0) |
| insuranceDetails | object | Insurance information |
| registrationDetails | object | Registration information |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64ghi789jkl012345",
    "plateNumber": "ABC-1234",
    "model": "Corolla",
    "manufacturer": "Toyota",
    "year": 2020,
    "status": "available",
    "mileage": 45000,
    "fuelType": "petrol",
    "transmission": "automatic",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  },
  "message": "Vehicle created successfully"
}
```

**Status Code**: 201

### Error Responses

**Duplicate Plate Number**
```json
{
  "success": false,
  "error": "Vehicle with this plate number already exists"
}
```

**Duplicate VIN**
```json
{
  "success": false,
  "error": "Vehicle with this VIN already exists"
}
```

---

## Add Maintenance Record

Add a new maintenance record to a vehicle.

### Request

```http
POST /api/v1/vehicles/:id/maintenance
Content-Type: application/json
```

### Request Body

```json
{
  "type": "oil-change",
  "description": "Regular oil change and filter replacement",
  "cost": 75.50,
  "performedBy": "ABC Auto Shop",
  "mileageAtService": 45000,
  "nextMaintenanceDate": "2024-04-15",
  "nextMaintenanceMileage": 50000,
  "parts": [
    {
      "name": "Oil Filter",
      "quantity": 1,
      "cost": 15.50
    },
    {
      "name": "Engine Oil",
      "quantity": 5,
      "cost": 60.00
    }
  ],
  "notes": "All fluids checked and topped off",
  "updateStatus": true,
  "status": "maintenance"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| type | string | Maintenance type |
| description | string | Description of work done |
| cost | number | Total cost |

### Maintenance Types

- oil-change
- tire-replacement
- brake-service
- inspection
- repair
- other

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64ghi789jkl012345",
    "plateNumber": "ABC-1234",
    "lastMaintenance": "2024-01-15T00:00:00.000Z",
    "nextMaintenanceDate": "2024-04-15T00:00:00.000Z",
    "nextMaintenanceMileage": 50000,
    "maintenanceHistory": [
      {
        "_id": "64xyz789abc012345",
        "date": "2024-01-15T00:00:00.000Z",
        "type": "oil-change",
        "description": "Regular oil change and filter replacement",
        "cost": 75.50,
        "performedBy": "ABC Auto Shop"
      }
    ]
  },
  "message": "Maintenance record added successfully"
}
```

---

## Update Vehicle Mileage

Update the current mileage of a vehicle.

### Request

```http
PATCH /api/v1/vehicles/:id/mileage
Content-Type: application/json
```

### Request Body

```json
{
  "mileage": 46500
}
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64ghi789jkl012345",
    "plateNumber": "ABC-1234",
    "mileage": 46500,
    "updatedAt": "2024-01-20T10:00:00.000Z"
  },
  "message": "Mileage updated successfully"
}
```

### Error Response

**Invalid Mileage**
```json
{
  "success": false,
  "error": "Invalid mileage value"
}
```

---

## Update Vehicle

Update an existing vehicle's information.

### Request

```http
PUT /api/v1/vehicles/:id
Content-Type: application/json
```

### Request Body

```json
{
  "status": "maintenance",
  "mileage": 46000,
  "notes": "Vehicle in shop for brake service"
}
```

**Note**: Only include fields you want to update.

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64ghi789jkl012345",
    "plateNumber": "ABC-1234",
    "status": "maintenance",
    "mileage": 46000,
    "notes": "Vehicle in shop for brake service",
    "updatedAt": "2024-01-20T14:15:00.000Z"
  },
  "message": "Vehicle updated successfully"
}
```

---

## Delete Vehicle

Delete a vehicle record.

**Warning**: Cannot delete vehicles with scheduled lessons.

### Request

```http
DELETE /api/v1/vehicles/:id
```

### Response

```json
{
  "success": true,
  "data": {},
  "message": "Vehicle deleted successfully"
}
```

### Error Responses

**Has Scheduled Lessons**
```json
{
  "success": false,
  "error": "Cannot delete vehicle with scheduled lessons"
}
```

---

## Data Models

### Vehicle Object

```typescript
{
  _id: string,
  plateNumber: string,
  model: string,
  manufacturer: string,
  year: number,
  color: string,
  vin: string,
  status: 'available' | 'in-use' | 'maintenance' | 'retired',
  mileage: number,
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid',
  transmission: 'manual' | 'automatic',
  lastMaintenance: Date,
  nextMaintenanceDate: Date,
  nextMaintenanceMileage: number,
  maintenanceHistory: MaintenanceRecord[],
  insuranceDetails: {
    provider: string,
    policyNumber: string,
    expiryDate: Date,
    coverage: string
  },
  registrationDetails: {
    registrationNumber: string,
    expiryDate: Date,
    state: string
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## Validation Rules

### Plate Number
- Required
- Must be unique
- Automatically converted to uppercase

### Year
- Required
- Range: 1990 to current year + 1

### VIN
- Optional
- Must be exactly 17 characters
- Must be unique

### Mileage
- Required
- Minimum: 0
- Cannot be negative

### Fuel Type
- Required
- One of: petrol, diesel, electric, hybrid

### Transmission
- Required
- One of: manual, automatic

### Status
- One of: available, in-use, maintenance, retired
- Default: available

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid data or validation error |
| 401 | Unauthorized | Missing or invalid token |
| 404 | Not Found | Vehicle doesn't exist |
| 409 | Conflict | Duplicate plate number or VIN |
| 500 | Server Error | Internal server error |

---

## Related Endpoints

- [Lessons API](./LESSONS.md) - Lessons using vehicles
- [Instructors API](./INSTRUCTORS.md) - Instructors driving vehicles

---

For more examples, see the [Frontend Guide](../guides/FRONTEND_GUIDE.md).