# Authentication API Documentation

Base URL: `/api/v1/auth`

All authentication endpoints except login and register are public. Other endpoints require authentication token.

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new admin |
| POST | `/login` | Login admin |
| GET | `/me` | Get current logged in admin |
| PUT | `/updatepassword` | Update admin password |
| POST | `/logout` | Logout admin |

---

## Register Admin

Create a new admin account.

### Request

```http
POST /api/v1/auth/register
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Malak Miliani",
  "email": "Malak@admin.com",
  "password": "password123",
  "role": "admin"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| name | string | Admin's full name (min 2 chars) |
| email | string | Valid email address (unique) |
| password | string | Password (min 6 chars) |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| role | string | Role: "admin" or "super-admin" (default: "admin") |

### Response

```json
{
  "success": true,
  "data": {
    "id": "64abc123def456789",
    "name": "Malak Miliani",
    "email": "Malak@admin.com",
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Status Code**: 201

### Error Responses

**Duplicate Email**
```json
{
  "success": false,
  "error": "Admin already exists with this email"
}
```
**Status Code**: 400

**Validation Error**
```json
{
  "success": false,
  "error": "Please provide name, email and password"
}
```
**Status Code**: 400

---

## Login Admin

Authenticate admin and receive JWT token.

### Request

```http
POST /api/v1/auth/login
Content-Type: application/json
```

### Request Body

```json
{
  "email": "Malak@admin.com",
  "password": "password123"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| email | string | Admin's email address |
| password | string | Admin's password |

### Response

```json
{
  "success": true,
  "data": {
    "id": "64abc123def456789",
    "name": "Malak Miliani",
    "email": "Malak@admin.com",
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Status Code**: 200

### Error Responses

**Invalid Credentials**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```
**Status Code**: 401

**Account Deactivated**
```json
{
  "success": false,
  "error": "Account is deactivated. Contact administrator."
}
```
**Status Code**: 403

### Example

```javascript
const response = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'Malak@admin.com',
    password: 'password123'
  })
});

const data = await response.json();

if (data.success) {
  // Save token to localStorage
  localStorage.setItem('token', data.data.token);
  localStorage.setItem('user', JSON.stringify(data.data));
}
```

---

## Get Current Admin

Get current logged in admin's information.

### Request

```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "64abc123def456789",
    "name": "Malak Miliani",
    "email": "Malak@admin.com",
    "role": "admin",
    "isActive": true,
    "lastLogin": "2024-01-15T10:30:00.000Z",
    "notificationSettings": {
      "emailEnabled": true,
      "emailNewStudent": true,
      "emailLessonReminder": true
    },
    "appearanceSettings": {
      "theme": "light",
      "fontSize": "medium"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Status Code**: 200

### Error Responses

**No Token**
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```
**Status Code**: 401

---

## Update Password

Update current admin's password.

### Request

```http
PUT /api/v1/auth/updatepassword
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| currentPassword | string | Current password |
| newPassword | string | New password (min 6 chars) |

### Response

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Password updated successfully"
}
```

**Status Code**: 200

### Error Responses

**Incorrect Current Password**
```json
{
  "success": false,
  "error": "Current password is incorrect"
}
```
**Status Code**: 401

---

## Logout Admin

Logout current admin (client-side token removal).

### Request

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

### Response

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Status Code**: 200

### Client-Side Implementation

```javascript
// Remove token from localStorage
localStorage.removeItem('token');
localStorage.removeItem('user');

// Call logout endpoint
await fetch('http://localhost:5000/api/v1/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Redirect to login
window.location.href = '/login';
```

---

## Authentication Flow

### Complete Login Flow

```
1. User enters email and password
   ↓
2. POST /api/v1/auth/login
   ↓
3. Server validates credentials
   ↓
4. Server generates JWT token
   ↓
5. Server updates lastLogin and session info
   ↓
6. Client receives token
   ↓
7. Client stores token in localStorage
   ↓
8. Client includes token in subsequent requests
```

### Token Usage

All protected routes require the JWT token in the Authorization header:

```javascript
const response = await fetch('http://localhost:5000/api/v1/students', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Security Features

### Password Hashing
- Passwords are hashed using bcrypt with 10 salt rounds
- Original passwords are never stored or logged

### JWT Tokens
- Tokens expire after 7 days (configurable in .env)
- Tokens contain admin ID and role
- Tokens are signed with JWT_SECRET

### Session Tracking
- Each login creates a session record
- Sessions track device, IP, and last activity
- Maximum 10 sessions kept per admin

### Account Protection
- Failed login attempts are logged
- Inactive accounts can be disabled
- Password requirements enforced

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid data or validation error |
| 401 | Unauthorized | Missing, invalid, or expired token |
| 403 | Forbidden | Account deactivated |
| 404 | Not Found | Admin doesn't exist |
| 500 | Server Error | Internal server error |

---

## Related Documentation

- [Admin Model](../models/ADMIN.md)
- [Frontend Integration Guide](../guides/FRONTEND_GUIDE.md)
- [Authentication Guide](../guides/AUTHENTICATION.md)

---

## cURL Examples

### Register
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Malak Miliani",
    "email": "Malak@admin.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "Malak@admin.com",
    "password": "password123"
  }'
```

### Get Current Admin
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

### Update Password
```bash
curl -X PUT http://localhost:5000/api/v1/auth/updatepassword \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword456"
  }'
```