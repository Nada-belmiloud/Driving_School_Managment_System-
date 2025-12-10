# Vehicle Model

The Vehicle model represents a driving school vehicle.

## Schema

```javascript
{
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  assignedInstructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instructor",
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'retired'],
    default: 'active'
  }
}
```

## Fields Description

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| brand | String | Yes | Vehicle brand (e.g., Renault, Peugeot) |
| model | String | Yes | Vehicle model (e.g., Clio, 208) |
| licensePlate | String | Yes | Unique license plate number |
| assignedInstructor | ObjectId | No | Reference to assigned Instructor |
| status | String | No | Vehicle status (default: active) |

## Status Values

| Value | Description |
|-------|-------------|
| active | Vehicle is available for use |
| maintenance | Vehicle is under maintenance |
| retired | Vehicle is no longer in service |

## Indexes

- Text index on: licensePlate, model, brand (for search)
- Index on: status

## Relationships

- **assignedInstructor** → Instructor model (one-to-one)

## Example Document

```json
{
  "_id": "64ghi789jkl012345",
  "brand": "Renault",
  "model": "Clio",
  "licensePlate": "12345-123-16",
  "assignedInstructor": "64def456abc789012",
  "status": "active",
  "createdAt": "2024-01-10T00:00:00.000Z",
  "updatedAt": "2024-01-20T10:30:00.000Z"
}
```

## Populated Document Example

```json
{
  "_id": "64ghi789jkl012345",
  "brand": "Renault",
  "model": "Clio",
  "licensePlate": "12345-123-16",
  "assignedInstructor": {
    "_id": "64def456abc789012",
    "name": "Ahmed Instructor",
    "email": "ahmed@drivingschool.com"
  },
  "status": "active"
}
```

