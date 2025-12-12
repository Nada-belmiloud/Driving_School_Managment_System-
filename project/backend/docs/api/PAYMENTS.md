# Payments API Documentation

Base URL: `/api/v1/payments`

All endpoints require authentication (include `Authorization: Bearer <token>` header).

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all payments (with filters) |
| GET | `/pending` | Get pending payments |
| GET | `/pending/count` | Get pending payments count and total |
| GET | `/candidate/:candidateId` | Get candidate's payments |
| GET | `/:id` | Get single payment by ID |
| POST | `/` | Create new payment |
| PUT | `/:id` | Update payment |
| DELETE | `/:id` | Delete payment |
| PUT | `/:id/mark-paid` | Mark payment as paid |

---

## Get All Payments

Retrieve a paginated list of payments with optional filters.

### Request

```http
GET /api/v1/payments?page=1&limit=10&status=pending&candidateId=64abc123
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| status | string | No | Filter by status (pending, paid) |
| candidateId | string | No | Filter by candidate ID |

### Response

```json
{
  "success": true,
  "count": 5,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "data": [
    {
      "_id": "64pqr567...",
      "candidateId": {
        "_id": "64abc123...",
        "name": "Mohammed Ali",
        "email": "mohammed@example.com",
        "phone": "0551234567"
      },
      "amount": 15000,
      "status": "pending",
      "date": "2024-01-15T00:00:00.000Z",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

## Get Pending Payments

Get all payments with status 'pending'.

### Request

```http
GET /api/v1/payments/pending
```

### Response

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "64pqr567...",
      "candidateId": {
        "_id": "64abc123...",
        "name": "Mohammed Ali",
        "phone": "0551234567"
      },
      "amount": 15000,
      "status": "pending",
      "date": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

---

## Get Pending Payments Count

Get count and total amount of pending payments (for dashboard).

### Request

```http
GET /api/v1/payments/pending/count
```

### Response

```json
{
  "success": true,
  "data": {
    "count": 10,
    "totalPendingAmount": 150000
  }
}
```

---

## Get Candidate Payments

Get all payments for a specific candidate.

### Request

```http
GET /api/v1/payments/candidate/:candidateId
```

### Response

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "64pqr567...",
      "amount": 15000,
      "status": "paid",
      "date": "2024-01-15T00:00:00.000Z"
    },
    {
      "_id": "64pqr568...",
      "amount": 10000,
      "status": "pending",
      "date": "2024-02-01T00:00:00.000Z"
    }
  ]
}
```

---

## Get Single Payment

Retrieve details of a specific payment by ID.

### Request

```http
GET /api/v1/payments/:id
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64pqr567...",
    "candidateId": {
      "_id": "64abc123...",
      "name": "Mohammed Ali",
      "email": "mohammed@example.com",
      "phone": "0551234567"
    },
    "amount": 15000,
    "status": "pending",
    "date": "2024-01-15T00:00:00.000Z",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
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
  "candidateId": "64abc123...",
  "amount": 15000,
  "status": "pending",
  "date": "2024-01-15"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| candidateId | string | Candidate's MongoDB ObjectId |
| amount | number | Payment amount (min: 0) |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| status | string | pending, paid (default: pending) |
| date | date | Payment date (default: now) |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64pqr567...",
    "candidateId": {
      "_id": "64abc123...",
      "name": "Mohammed Ali",
      "email": "mohammed@example.com",
      "phone": "0551234567"
    },
    "amount": 15000,
    "status": "pending",
    "date": "2024-01-15T00:00:00.000Z"
  },
  "message": "Payment recorded successfully"
}
```
**Status Code**: 201

### Error Response

**Candidate Not Found**
```json
{
  "success": false,
  "error": "Candidate not found"
}
```
**Status Code**: 404

---

## Update Payment

Update an existing payment.

### Request

```http
PUT /api/v1/payments/:id
Content-Type: application/json
```

### Request Body

```json
{
  "amount": 17000,
  "status": "paid"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64pqr567...",
    "amount": 17000,
    "status": "paid"
  },
  "message": "Payment updated successfully"
}
```

---

## Delete Payment

Delete a payment record.

### Request

```http
DELETE /api/v1/payments/:id
```

### Response

```json
{
  "success": true,
  "message": "Payment deleted successfully"
}
```

---

## Mark as Paid

Mark a pending payment as paid.

### Request

```http
PUT /api/v1/payments/:id/mark-paid
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64pqr567...",
    "status": "paid"
  },
  "message": "Payment marked as paid"
}
```

### Error Response

**Already Paid**
```json
{
  "success": false,
  "error": "Payment is already marked as paid"
}
```
**Status Code**: 400

---

## Data Model

### Payment Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| candidateId | ObjectId | Yes | Reference to Candidate |
| amount | Number | Yes | Payment amount (min: 0) |
| status | String | No | pending, paid (default: pending) |
| date | Date | No | Payment date (default: now) |

---

## cURL Examples

### Get All Payments
```bash
curl -X GET "http://localhost:5000/api/v1/payments?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Create Payment
```bash
curl -X POST http://localhost:5000/api/v1/payments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateId": "64abc123...",
    "amount": 15000
  }'
```

### Mark as Paid
```bash
curl -X PUT http://localhost:5000/api/v1/payments/64pqr567.../mark-paid \
  -H "Authorization: Bearer <token>"
```

### Get Pending Count
```bash
curl -X GET http://localhost:5000/api/v1/payments/pending/count \
  -H "Authorization: Bearer <token>"
```

