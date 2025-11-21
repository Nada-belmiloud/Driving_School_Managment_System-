# Students API Documentation

Base URL: `/api/v1/students`

All endpoints require authentication (include `Authorization: Bearer <token>` header).

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all students (with filters) |
| GET | `/stats` | Get student statistics |
| GET | `/:id` | Get single student by ID |
| POST | `/` | Create new student |
| PUT | `/:id` | Update student |
| DELETE | `/:id` | Delete student |

---

## Get All Students

Retrieve a paginated list of students with optional filters.

### Request

```http
GET /api/v1/students?page=1&limit=10&search=john&licenseType=B&status=active
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10, max: 100) |
| search | string | No | Search by name, email, or phone |
| licenseType | string | No | Filter by license type (A, B, C, D) |
| status | string | No | Filter by status (active, completed, suspended, dropped) |
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
      "_id": "64abc123...",
      "name": "Azizi Abdellah",
      "email": "abdellah.azizi@ensia.edu.dz",
      "phone": "1234567890",
      "address": "123 Main St",
      "licenseType": "B",
      "dateOfBirth": "2000-01-01T00:00:00.000Z",
      "registrationDate": "2024-01-15T10:30:00.000Z",
      "status": "active",
      "progress": {
        "theoryLessons": 5,
        "practicalLessons": 10,
        "theoryTestPassed": true,
        "practicalTestPassed": false
      },
      "notes": "Good student, learns quickly",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-20T14:15:00.000Z"
    }
  ]
}
```

### Example

```javascript
const response = await fetch('http://localhost:5000/api/v1/students?page=1&limit=10&search=john', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
console.log(data.data); // Array of students
```

---

## Get Student Statistics

Retrieve statistics about students.

### Request

```http
GET /api/v1/students/stats
```

### Response (just an example)

```json
{
  "success": true,
  "data": {
    "total": 150,
    "recentlyRegistered": 12,
    "byLicenseType": {
      "A": 20,
      "B": 100,
      "C": 25,
      "D": 5
    },
    "byStatus": {
      "active": 100,
      "completed": 35,
      "suspended": 10,
      "dropped": 5
    }
  }
}
```

---

## Get Single Student

Retrieve details of a specific student by ID.

### Request

```http
GET /api/v1/students/:id
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Student ID (MongoDB ObjectId) |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "name": "Aymen Benmalek",
    "email": "Aymen.benmalek@ensia.edu.dz",
    "phone": "1234567890",
    "address": "123 Main St",
    "licenseType": "B",
    "dateOfBirth": "2005-04-04T00:00:00.000Z",
    "registrationDate": "2024-01-15T10:30:00.000Z",
    "status": "active",
    "progress": {
      "theoryLessons": 5,
      "practicalLessons": 10,
      "theoryTestPassed": true,
      "practicalTestPassed": false
    },
    "notes": "Good student",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:15:00.000Z"
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

## Create Student

Create a new student record.

### Request

```http
POST /api/v1/students
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Mohammed",
  "email": "Mohammed@example.com",
  "phone": "1234567890",
  "address": "123 Main St",
  "licenseType": "B",
  "dateOfBirth": "2000-01-01",
  "notes": "New student registration"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| name | string | Student's full name (min 2 chars) |
| email | string | Valid email address (unique) |
| phone | string | Phone number (10-15 digits) |
| licenseType | string | License type: A, B, C, or D |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| address | string | Home address |
| dateOfBirth | date | Birth date (age must be 16-100) |
| notes | string | Additional notes |

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "name": "Mohammed",
    "email": "Mohammed@example.com",
    "phone": "1234567890",
    "address": "123 Main St",
    "licenseType": "B",
    "dateOfBirth": "2000-01-01T00:00:00.000Z",
    "registrationDate": "2024-01-15T10:30:00.000Z",
    "status": "active",
    "progress": {
      "theoryLessons": 0,
      "practicalLessons": 0,
      "theoryTestPassed": false,
      "practicalTestPassed": false
    },
    "notes": "New student registration",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Student created successfully"
}
```

**Status Code**: 201

### Error Responses

**Duplicate Email**
```json
{
  "success": false,
  "error": "Student with this email already exists"
}
```
**Status Code**: 400

**Validation Error**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": "Please provide a valid email",
    "phone": "Phone must be 10-15 digits"
  }
}
```
**Status Code**: 400

### Example

```javascript
const newStudent = await fetch('http://localhost:5000/api/v1/students', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Hammoud',
    email: 'Hammoud@example.com',
    phone: '1234567890',
    licenseType: 'B',
    dateOfBirth: '2000-01-01'
  })
});
const data = await newStudent.json();
```

---

## Update Student

Update an existing student's information.

### Request

```http
PUT /api/v1/students/:id
Content-Type: application/json
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Student ID |

### Request Body

```json
{
  "phone": "9876543210",
  "address": "456 New St",
  "status": "completed",
  "notes": "Updated information"
}
```

**Note**: Only include fields you want to update. All fields are optional.

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "name": "Hammoud",
    "email": "Hammoud@example.com",
    "phone": "9876543210",
    "address": "456 New St",
    "status": "completed",
    "notes": "Updated information",
    "updatedAt": "2024-01-20T14:15:00.000Z"
  },
  "message": "Student updated successfully"
}
```

### Error Response

**Student Not Found**
```json
{
  "success": false,
  "error": "Student not found"
}
```
**Status Code**: 404

**Duplicate Email** (if trying to change email to existing one)
```json
{
  "success": false,
  "error": "Email already in use"
}
```
**Status Code**: 400

---

## Delete Student

Delete a student record.

**Warning**: This permanently removes the student and cannot be undone.

### Request

```http
DELETE /api/v1/students/:id
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Student ID |

### Response

```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

**Status Code**: 200

### Error Response

```json
{
  "success": false,
  "error": "Student not found"
}
```
**Status Code**: 404

### Example

```javascript
const response = await fetch(`http://localhost:5000/api/v1/students/${studentId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

---

## Data Models

### Student Object

```typescript
{
  _id: string,              // MongoDB ObjectId
  name: string,             // Full name
  email: string,            // Unique email
  phone: string,            // Phone number (10-15 digits)
  address?: string,         // Optional address
  licenseType: 'A'|'B'|'C'|'D',  // License type
  dateOfBirth: Date,        // Birth date
  registrationDate: Date,   // Registration date (auto-set)
  status: 'active'|'completed'|'suspended'|'dropped',  // Student status
  progress: {
    theoryLessons: number,       // Theory lessons taken
    practicalLessons: number,    // Practical lessons taken
    theoryTestPassed: boolean,   // Theory test status
    practicalTestPassed: boolean // Practical test status
  },
  notes?: string,           // Optional notes
  createdAt: Date,          // Created timestamp
  updatedAt: Date           // Updated timestamp
}
```

## Validation Rules

### Name
- Required
- Minimum 2 characters
- Maximum 100 characters

### Email
- Required
- Must be valid email format
- Must be unique
- Case-insensitive

### Phone
- Required
- Must be 10-15 digits
- Numbers only

### License Type
- Required
- Must be one of: A, B, C, D

### Date of Birth
- Optional
- Age must be between 16 and 100 years

### Status
- One of: active, completed, suspended, dropped
- Default: active

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid data or validation error |
| 401 | Unauthorized | Missing or invalid token |
| 404 | Not Found | Student doesn't exist |
| 409 | Conflict | Duplicate email |
| 500 | Server Error | Internal server error |

## Related Endpoints

- [Lessons API](./LESSONS.md) - Schedule lessons for students
- [Payments API](./PAYMENTS.md) - Manage student payments
- [Authentication API](./AUTH.md) - Login and authentication

---

For more examples and use cases, see the [Frontend Guide](../guides/FRONTEND_GUIDE.md).