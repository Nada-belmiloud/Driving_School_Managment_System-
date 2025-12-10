# Instructor Model

The Instructor model represents a driving instructor.

## Schema

```javascript
{
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    match: /^[0-9]{10,15}$/
  },
  address: {
    type: String,
    trim: true,
    maxlength: 200
  },
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'deleted'],
    default: 'active'
  }
}
```

## Fields Description

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | Yes | Full name (2-100 characters) |
| email | String | Yes | Unique email address |
| phone | String | Yes | Phone number (10-15 digits) |
| address | String | No | Address (max 200 characters) |
| assignedVehicle | ObjectId | No | Reference to assigned Vehicle |
| status | String | No | Current status (default: active) |

## Status Values

| Value | Description |
|-------|-------------|
| active | Currently employed instructor |
| deleted | Soft deleted (inactive) |

## Indexes

- Text index on: name, email (for search)
- Index on: status

## Relationships

- **assignedVehicle** → Vehicle model (one-to-one)

## Example Document

```json
{
  "_id": "64def456abc789012",
  "name": "Ahmed Instructor",
  "email": "ahmed@drivingschool.com",
  "phone": "0559876543",
  "address": "456 Instructor St, Algiers",
  "assignedVehicle": "64ghi789jkl012345",
  "status": "active",
  "createdAt": "2024-01-10T00:00:00.000Z",
  "updatedAt": "2024-01-20T10:30:00.000Z"
}
```

## Populated Document Example

```json
{
  "_id": "64def456abc789012",
  "name": "Ahmed Instructor",
  "email": "ahmed@drivingschool.com",
  "phone": "0559876543",
  "address": "456 Instructor St, Algiers",
  "assignedVehicle": {
    "_id": "64ghi789jkl012345",
    "brand": "Renault",
    "model": "Clio",
    "licensePlate": "12345-123-16"
  },
  "status": "active"
}
```

