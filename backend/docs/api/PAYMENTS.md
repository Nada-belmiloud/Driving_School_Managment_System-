# Payments API Documentation

Base URL: `/api/v1/payments`

All endpoints require authentication (include `Authorization: Bearer <token>` header).

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all payments (with filters) |
| GET | `/stats` | Get payment statistics |
| GET | `/pending` | Get pending payments |
| GET | `/student/:studentId` | Get student's payment history |
| GET | `/:id` | Get single payment by ID |
| POST | `/` | Create new payment |
| PUT | `/:id` | Update payment |
| PUT | `/:id/mark-paid` | Mark payment as paid |
| DELETE | `/:id` | Delete payment |

---

## Get All Payments

Retrieve a paginated list of payments with optional filters.

### Request

```http
GET /api/v1/payments?page=1&limit=10&status=pending&studentId=64abc123
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| status | string | No | Filter by status (pending, paid, refunded, failed) |
| studentId | string | No | Filter by student ID |
| sortBy | string | No | Sort field (default: -date) |

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
      "_id": "64mno345pqr678901",
      "studentId": {
        "_id": "64abc123def456789",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "1234567890"
      },
      "amount": 150.00,
      "method": "card",
      "status": "paid",
      "date": "2024-01-15T00:00:00.000Z",
      "paidDate": "2024-01-15T14:20:00.000Z",
      "receiptNumber": "RCP-1705318200-A1B2C3D4",
      "description": "Payment for 3 practical driving lessons",
      "category": "lesson",
      "transactionId": "TXN-ABC123XYZ789",
      "notes": "Payment processed via online portal",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T14:20:00.000Z"
    }
  ]
}
```

---

## Get Payment Statistics

Retrieve statistics about payments and revenue.

### Request

```http
GET /api/v1/payments/stats
```

### Response

```json
{
  "success": true,
  "data": {
    "totalPaid": 1250,
    "totalPending": 45,
    "totalRevenue": 187500.00,
    "pendingAmount": 6750.00,
    "byMethod": [
      {
        "_id": "card",
        "count": 800,
        "amount": 120000.00
      },
      {
        "_id": "cash",
        "count": 350,
        "amount": 52500.00
      },
      {
        "_id": "transfer",
        "count": 100,
        "amount": 15000.00
      }
    ]
  }
}
```

---

## Get Pending Payments

Get all payments with pending status.

### Request

```http
GET /api/v1/payments/pending
```

### Response

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "64mno345pqr678901",
      "studentId": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "1234567890"
      },
      "amount": 150.00,
      "method": "cash",
      "status": "pending",
      "date": "2024-01-20T00:00:00.000Z",
      "description": "Payment for 3 driving lessons",
      "category": "lesson"
    }
  ]
}
```

---

## Get Student Payments

Get all payments for a specific student.

### Request

```http
GET /api/v1/payments/student/:studentId
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| studentId | string | Student ID (MongoDB ObjectId) |

### Response

```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "_id": "64mno345pqr678901",
        "amount": 150.00,
        "method": "card",
        "status": "paid",
        "date": "2024-01-15T00:00:00.000Z",
        "paidDate": "2024-01-15T14:20:00.000Z",
        "receiptNumber": "RCP-1705318200-A1B2C3D4",
        "description": "Payment for 3 practical driving lessons",
        "category": "lesson"
      },
      {
        "_id": "64mno345pqr678902",
        "amount": 100.00,
        "method": "cash",
        "status": "pending",
        "date": "2024-01-20T00:00:00.000Z",
        "description": "Payment for 2 theory lessons",
        "category": "lesson"
      }
    ],
    "summary": {
      "totalPaid": 450.00,
      "totalPending": 100.00,
      "paymentCount": 5
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Student not found"
}
```

**Status Code**: 404

---

## Get Single Payment

Retrieve details of a specific payment by ID.

### Request

```http
GET /api/v1/payments/:id
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Payment ID (MongoDB ObjectId) |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64mno345pqr678901",
    "studentId": {
      "_id": "64abc123def456789",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890"
    },
    "amount": 150.00,
    "method": "card",
    "status": "paid",
    "date": "2024-01-15T00:00:00.000Z",
    "paidDate": "2024-01-15T14:20:00.000Z",
    "receiptNumber": "RCP-1705318200-A1B2C3D4",
    "description": "Payment for 3 practical driving lessons",
    "category": "lesson",
    "transactionId": "TXN-ABC123XYZ789",
    "notes": "Payment processed via online portal",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T14:20:00.000Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Payment not found"
}
```

**Status Code**: 404

---

## Create Payment

Create a new payment record.

### Request

```http
POST /api/v1/payments
Content-Type: application/json
```

### Request Body

```json
{
  "studentId": "64abc123def456789",
  "amount": 150.00,
  "method": "card",
  "status": "paid",
  "date": "2024-01-15",
  "paidDate": "2024-01-15T14:20:00.000Z",
  "description": "Payment for 3 practical driving lessons",
  "category": "lesson",
  "transactionId": "TXN-ABC123XYZ789",
  "notes": "Payment processed via online portal"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| studentId | string | Student ID (must exist) |
| amount | number | Payment amount (≥ 0) |
| method | string | Payment method |

### Payment Methods

- cash
- card
- transfer
- check

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| status | string | Payment status (default: pending) |
| date | date | Payment date (default: now) |
| paidDate | date | When payment was received |
| description | string | Payment description (max 200 chars) |
| category | string | Payment category (default: lesson) |
| transactionId | string | External transaction ID |
| notes | string | Additional notes (max 300 chars) |

### Payment Categories

- registration
- lesson
- exam-fee
- material
- other

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64mno345pqr678901",
    "studentId": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890"
    },
    "amount": 150.00,
    "method": "card",
    "status": "paid",
    "date": "2024-01-15T00:00:00.000Z",
    "paidDate": "2024-01-15T14:20:00.000Z",
    "receiptNumber": "RCP-1705318200-A1B2C3D4",
    "description": "Payment for 3 practical driving lessons",
    "category": "lesson",
    "transactionId": "TXN-ABC123XYZ789",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T14:20:00.000Z"
  },
  "message": "Payment recorded successfully"
}
```

**Status Code**: 201

**Note**: Receipt number is auto-generated if not provided.

### Error Responses

**Student Not Found**
```json
{
  "success": false,
  "error": "Student not found"
}
```
**Status Code**: 404

**Invalid Amount**
```json
{
  "success": false,
  "error": "Amount cannot be negative"
}
```
**Status Code**: 400

---

## Update Payment

Update an existing payment's information.

### Request

```http
PUT /api/v1/payments/:id
Content-Type: application/json
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Payment ID |

### Request Body

```json
{
  "amount": 200.00,
  "notes": "Updated amount after discount applied"
}
```

**Note**: Only include fields you want to update. All fields are optional.

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64mno345pqr678901",
    "studentId": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890"
    },
    "amount": 200.00,
    "method": "card",
    "status": "paid",
    "notes": "Updated amount after discount applied",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  },
  "message": "Payment updated successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Payment not found"
}
```

**Status Code**: 404

---

## Mark Payment as Paid

Mark a pending payment as paid.

### Request

```http
PUT /api/v1/payments/:id/mark-paid
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Payment ID |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64mno345pqr678901",
    "studentId": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890"
    },
    "amount": 150.00,
    "method": "cash",
    "status": "paid",
    "date": "2024-01-15T00:00:00.000Z",
    "paidDate": "2024-01-20T10:00:00.000Z",
    "receiptNumber": "RCP-1705318200-A1B2C3D4",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  },
  "message": "Payment marked as paid"
}
```

**Note**: This automatically sets `paidDate` to current timestamp and updates status to "paid".

---

## Delete Payment

Delete a payment record.

**Warning**: This permanently removes the payment and cannot be undone.

### Request

```http
DELETE /api/v1/payments/:id
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Payment ID |

### Response

```json
{
  "success": true,
  "data": {},
  "message": "Payment deleted successfully"
}
```

**Status Code**: 200

### Error Response

```json
{
  "success": false,
  "error": "Payment not found"
}
```

**Status Code**: 404

---

## Data Models

### Payment Object

```typescript
{
  _id: string,
  studentId: string | Student,
  amount: number,
  method: 'cash' | 'card' | 'transfer' | 'check',
  status: 'pending' | 'paid' | 'refunded' | 'failed',
  date: Date,
  paidDate?: Date,
  receiptNumber: string,
  description?: string,
  category: 'registration' | 'lesson' | 'exam-fee' | 'material' | 'other',
  transactionId?: string,
  notes?: string,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Validation Rules

### Student ID
- Required
- Must be valid MongoDB ObjectId
- Student must exist in database

### Amount
- Required
- Must be a number
- Cannot be negative (≥ 0)

### Method
- Required
- One of: cash, card, transfer, check

### Status
- One of: pending, paid, refunded, failed
- Default: pending

### Category
- One of: registration, lesson, exam-fee, material, other
- Default: lesson

### Description
- Optional
- Maximum 200 characters

### Notes
- Optional
- Maximum 300 characters

---

## Receipt Number Format

Receipt numbers are auto-generated in the format:

```
RCP-{timestamp}-{random}
```

Example: `RCP-1705318200-A1B2C3D4`

- `RCP`: Prefix for "Receipt"
- `{timestamp}`: Unix timestamp
- `{random}`: Random 8-character alphanumeric string (uppercase)

---

## Business Rules

### Status Transitions

```
pending → paid ✓
pending → failed ✓
paid → refunded ✓
refunded → [no changes]
failed → pending ✓
```

### Payment Recording
- Every payment must be linked to a student
- Receipt numbers are automatically generated and unique
- Paid date is automatically set when marking as paid

### Student Payment History
- All payments are kept in student's payment history
- Total paid and pending amounts are tracked
- Payment history is sorted by date (newest first)

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid data or validation error |
| 401 | Unauthorized | Missing or invalid token |
| 404 | Not Found | Payment or student not found |
| 500 | Server Error | Internal server error |

---

## Related Endpoints

- [Students API](./STUDENTS.md) - Students making payments
- [Lessons API](./LESSONS.md) - Lessons that require payment

---

## cURL Examples

### Get All Payments
```bash
curl -X GET "http://localhost:5000/api/v1/payments?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Payment
```bash
curl -X POST http://localhost:5000/api/v1/payments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "64abc123def456789",
    "amount": 150.00,
    "method": "card",
    "status": "paid",
    "description": "Payment for 3 driving lessons",
    "category": "lesson"
  }'
```

### Get Student Payments
```bash
curl -X GET http://localhost:5000/api/v1/payments/student/64abc123def456789 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Mark as Paid
```bash
curl -X PUT http://localhost:5000/api/v1/payments/64mno345pqr678901/mark-paid \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Delete Payment
```bash
curl -X DELETE http://localhost:5000/api/v1/payments/64mno345pqr678901 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

For more examples and use cases, see the [Frontend Guide](../guides/FRONTEND_GUIDE.md).