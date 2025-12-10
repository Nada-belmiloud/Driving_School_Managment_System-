# Payment Model

The Payment model represents a payment record for a candidate.

## Schema

```javascript
{
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate",
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  date: {
    type: Date,
    default: Date.now
  }
}
```

## Fields Description

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| candidateId | ObjectId | Yes | Reference to the Candidate |
| amount | Number | Yes | Payment amount (min: 0) |
| status | String | No | Payment status (default: pending) |
| date | Date | No | Payment date (default: now) |

## Status Values

| Value | Description |
|-------|-------------|
| pending | Payment is due but not yet received |
| paid | Payment has been received |

## Indexes

- Compound index on: candidateId, date (descending)
- Index on: status
- Index on: date (descending)

## Relationships

- **candidateId** → Candidate model

## Example Document

```json
{
  "_id": "64pqr567stu890123",
  "candidateId": "64abc123def456789",
  "amount": 15000,
  "status": "pending",
  "date": "2024-01-15T00:00:00.000Z",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

## Populated Document Example

```json
{
  "_id": "64pqr567stu890123",
  "candidateId": {
    "_id": "64abc123def456789",
    "name": "Mohammed Ali",
    "email": "mohammed@example.com",
    "phone": "0551234567"
  },
  "amount": 15000,
  "status": "pending",
  "date": "2024-01-15T00:00:00.000Z"
}
```

## Aggregations

### Pending Payments Summary
Used for dashboard statistics:

```javascript
Payment.aggregate([
  { $match: { status: 'pending' } },
  {
    $group: {
      _id: null,
      count: { $sum: 1 },
      totalAmount: { $sum: '$amount' }
    }
  }
])
```

Returns:
```json
{
  "count": 25,
  "totalAmount": 375000
}
```

