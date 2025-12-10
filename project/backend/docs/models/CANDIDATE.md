# Candidate Model

The Candidate model represents a driving school student/candidate.

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
  dateOfBirth: {
    type: Date,
    // Must be between 16 and 100 years old
  },
  licenseType: {
    type: String,
    required: true,
    enum: ['A1', 'A2', 'B', 'C1', 'C2', 'D']
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'deleted'],
    default: 'active'
  },
  progress: {
    type: String,
    enum: ['highway_code', 'parking', 'driving'],
    default: 'highway_code'
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
| dateOfBirth | Date | No | Date of birth (must be 16-100 years old) |
| licenseType | String | Yes | License category being pursued |
| registrationDate | Date | No | When the candidate registered (default: now) |
| status | String | No | Current status (default: active) |
| progress | String | No | Current training phase (default: highway_code) |

## License Types

| Value | Description |
|-------|-------------|
| A1 | Motorcycle up to 125cc |
| A2 | Motorcycle up to 35kW |
| B | Passenger car |
| C1 | Light truck |
| C2 | Heavy truck |
| D | Bus |

## Status Values

| Value | Description |
|-------|-------------|
| active | Currently enrolled and training |
| completed | Successfully completed training |
| deleted | Soft deleted (inactive) |

## Progress Phases

| Value | Description |
|-------|-------------|
| highway_code | Theory/Highway code phase |
| parking | Parking practice phase |
| driving | Road driving phase |

## Indexes

- Text index on: name, email, phone (for search)
- Compound index on: licenseType, status
- Index on: progress

## Validation Rules

- **Email**: Must be a valid email format
- **Phone**: Must be 10-15 digits only
- **Age**: If dateOfBirth is provided, candidate must be between 16 and 100 years old
- **Name**: Must be between 2 and 100 characters

## Example Document

```json
{
  "_id": "64abc123def456789",
  "name": "Mohammed Ali",
  "email": "mohammed@example.com",
  "phone": "0551234567",
  "address": "123 Main St, Algiers",
  "dateOfBirth": "2000-01-15T00:00:00.000Z",
  "licenseType": "B",
  "registrationDate": "2024-01-15T10:30:00.000Z",
  "status": "active",
  "progress": "parking",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-20T14:15:00.000Z"
}
```

