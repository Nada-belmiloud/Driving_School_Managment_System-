# Schedule Model

The Schedule model represents a training session between a candidate and instructor.

## Schema

```javascript
{
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate",
    required: true
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instructor",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true,
    match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
  },
  status: {
    type: String,
    enum: ['scheduled', 'cancelled', 'completed'],
    default: 'scheduled'
  },
  lessonType: {
    type: String,
    enum: ['highway_code', 'parking', 'driving'],
    required: true
  }
}
```

## Fields Description

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| candidateId | ObjectId | Yes | Reference to the Candidate |
| instructorId | ObjectId | Yes | Reference to the Instructor |
| date | Date | Yes | Session date |
| time | String | Yes | Session time in HH:MM format |
| status | String | No | Session status (default: scheduled) |
| lessonType | String | Yes | Type of training session |

## Status Values

| Value | Description |
|-------|-------------|
| scheduled | Session is scheduled |
| cancelled | Session was cancelled |
| completed | Session was completed |

## Lesson Types

| Value | Description |
|-------|-------------|
| highway_code | Theory/Highway code session |
| parking | Parking practice session |
| driving | Road driving session |

## Indexes

- Compound index on: date, time
- Compound index on: candidateId, date
- Compound index on: instructorId, date
- Index on: status
- Compound index on: instructorId, date, time (for conflict checking)

## Relationships

- **candidateId** → Candidate model
- **instructorId** → Instructor model

## Example Document

```json
{
  "_id": "64jkl012mno345678",
  "candidateId": "64abc123def456789",
  "instructorId": "64def456abc789012",
  "date": "2024-01-20T00:00:00.000Z",
  "time": "10:00",
  "status": "scheduled",
  "lessonType": "driving",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

## Populated Document Example

```json
{
  "_id": "64jkl012mno345678",
  "candidateId": {
    "_id": "64abc123def456789",
    "name": "Mohammed Ali",
    "email": "mohammed@example.com",
    "phone": "0551234567"
  },
  "instructorId": {
    "_id": "64def456abc789012",
    "name": "Ahmed Instructor",
    "email": "ahmed@drivingschool.com"
  },
  "date": "2024-01-20T00:00:00.000Z",
  "time": "10:00",
  "status": "scheduled",
  "lessonType": "driving"
}
```

