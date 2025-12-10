# Exam Model

The Exam model represents a test/exam taken by a candidate.

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
  examType: {
    type: String,
    enum: ['highway_code', 'parking', 'driving'],
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
    enum: ['scheduled', 'passed', 'failed', 'cancelled'],
    default: 'scheduled'
  },
  attemptNumber: {
    type: Number,
    default: 1,
    min: 1
  },
  notes: {
    type: String,
    maxlength: 500
  }
}
```

## Fields Description

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| candidateId | ObjectId | Yes | Reference to the Candidate |
| instructorId | ObjectId | Yes | Reference to the Instructor |
| examType | String | Yes | Type of exam |
| date | Date | Yes | Exam date |
| time | String | Yes | Exam time in HH:MM format |
| status | String | No | Exam status (default: scheduled) |
| attemptNumber | Number | No | Which attempt this is (default: 1) |
| notes | String | No | Notes from instructor (max 500 chars) |

## Status Values

| Value | Description |
|-------|-------------|
| scheduled | Exam is scheduled |
| passed | Candidate passed the exam |
| failed | Candidate failed the exam |
| cancelled | Exam was cancelled |

## Exam Types

| Value | Description |
|-------|-------------|
| highway_code | Theory/Highway code exam |
| parking | Parking exam |
| driving | Road driving exam |

## Indexes

- Compound index on: candidateId, examType
- Compound index on: instructorId, date
- Compound index on: date, time
- Index on: status

## Static Methods

### canTakeExam(candidateId, examType)

Checks if a candidate can take a specific exam type based on the 15-day waiting rule.

**Returns:**
```javascript
// If can take:
{ canTake: true }

// If cannot take:
{
  canTake: false,
  reason: "Must wait 15 days between exam attempts. Next available date: 2024-02-05",
  waitUntil: Date
}
```

## Business Rules

### 15-Day Waiting Rule
- After a failed exam, the candidate must wait 15 days before attempting the same exam type again
- This is enforced at the controller level using the `canTakeExam` static method

### Attempt Tracking
- The `attemptNumber` field automatically tracks how many times a candidate has attempted each exam type
- Calculated when scheduling a new exam based on previous attempts

## Example Document

```json
{
  "_id": "64xyz890abc123456",
  "candidateId": "64abc123def456789",
  "instructorId": "64def456abc789012",
  "examType": "driving",
  "date": "2024-01-25T00:00:00.000Z",
  "time": "09:00",
  "status": "scheduled",
  "attemptNumber": 1,
  "notes": null,
  "createdAt": "2024-01-20T10:00:00.000Z",
  "updatedAt": "2024-01-20T10:00:00.000Z"
}
```

## Populated Document Example

```json
{
  "_id": "64xyz890abc123456",
  "candidateId": {
    "_id": "64abc123def456789",
    "name": "Mohammed Ali",
    "email": "mohammed@example.com"
  },
  "instructorId": {
    "_id": "64def456abc789012",
    "name": "Ahmed Instructor"
  },
  "examType": "driving",
  "date": "2024-01-25T00:00:00.000Z",
  "time": "09:00",
  "status": "passed",
  "attemptNumber": 1,
  "notes": "Excellent performance"
}
```

