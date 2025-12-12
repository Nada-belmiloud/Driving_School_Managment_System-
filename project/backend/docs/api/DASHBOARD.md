# Dashboard API Documentation

Base URL: `/api/v1/dashboard`

All endpoints require authentication (include `Authorization: Bearer <token>` header).

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Get dashboard statistics |

---

## Get Dashboard Statistics

Get comprehensive statistics for the dashboard.

### Request

```http
GET /api/v1/dashboard/stats
Authorization: Bearer <token>
```

### Response

```json
{
  "success": true,
  "data": {
    "totalCandidates": 150,
    "totalInstructors": 12,
    "totalVehicles": 8,
    "pendingPayments": {
      "count": 25,
      "totalAmount": 375000
    }
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| totalCandidates | number | Total active candidates (excluding deleted) |
| totalInstructors | number | Total active instructors (excluding deleted) |
| totalVehicles | number | Total active vehicles (excluding retired) |
| pendingPayments.count | number | Number of pending payments |
| pendingPayments.totalAmount | number | Sum of all pending payment amounts |

---

## cURL Examples

### Get Dashboard Stats
```bash
curl -X GET http://localhost:5000/api/v1/dashboard/stats \
  -H "Authorization: Bearer <token>"
```

---

## Usage in Frontend

```javascript
// Fetch dashboard stats
const response = await fetch('http://localhost:5000/api/v1/dashboard/stats', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();

if (data.success) {
  console.log('Total Candidates:', data.data.totalCandidates);
  console.log('Total Instructors:', data.data.totalInstructors);
  console.log('Total Vehicles:', data.data.totalVehicles);
  console.log('Pending Payments:', data.data.pendingPayments.count);
  console.log('Pending Amount:', data.data.pendingPayments.totalAmount);
}
```

