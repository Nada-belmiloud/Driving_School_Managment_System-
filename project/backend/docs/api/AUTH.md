# Authentication API Documentation

Base URL: `/api/v1/auth`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/login` | Login admin | No |
| GET | `/me` | Get current logged in admin | Yes |
| PUT | `/email` | Update admin email | Yes |
| PUT | `/password` | Update admin password | Yes |
| PUT | `/name` | Update admin name | Yes |
| POST | `/logout` | Logout admin | Yes |

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
  "email": "admin@drivingschool.com",
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
    "name": "Admin Name",
    "email": "admin@drivingschool.com",
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

**Missing Fields**
```json
{
  "success": false,
  "error": "Please provide email and password"
}
```
**Status Code**: 400

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
    "id": "64abc123def456789",
    "name": "Admin Name",
    "email": "admin@drivingschool.com"
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

## Update Email

Update current admin's email address.

### Request

```http
PUT /api/v1/auth/email
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "email": "newemail@drivingschool.com",
  "password": "currentpassword123"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| email | string | New email address |
| password | string | Current password for confirmation |

### Response

```json
{
  "success": true,
  "message": "Email updated successfully",
  "data": {
    "email": "newemail@drivingschool.com"
  }
}
```

**Status Code**: 200

### Error Responses

**Incorrect Password**
```json
{
  "success": false,
  "error": "Password is incorrect"
}
```
**Status Code**: 401

**Email Already In Use**
```json
{
  "success": false,
  "error": "Email already in use"
}
```
**Status Code**: 400

---

## Update Password

Update current admin's password.

### Request

```http
PUT /api/v1/auth/password
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

## Update Name

Update current admin's name.

### Request

```http
PUT /api/v1/auth/name
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "name": "New Admin Name"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| name | string | New name (min 2 chars) |

### Response

```json
{
  "success": true,
  "message": "Name updated successfully",
  "data": {
    "name": "New Admin Name"
  }
}
```

**Status Code**: 200

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

---

## Authentication Flow

### Token Usage

All protected routes require the JWT token in the Authorization header:

```javascript
const response = await fetch('http://localhost:5000/api/v1/candidates', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Client-Side Implementation

```javascript
// Login
const loginResponse = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const data = await loginResponse.json();
if (data.success) {
  localStorage.setItem('token', data.data.token);
}

// Logout
localStorage.removeItem('token');
await fetch('http://localhost:5000/api/v1/auth/logout', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Security Features

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens expire after 7 days (configurable)
- Rate limiting on login endpoint
- Protected routes require valid JWT token

---

## cURL Examples

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@drivingschool.com", "password": "password123"}'
```

### Get Current Admin
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

### Update Password
```bash
curl -X PUT http://localhost:5000/api/v1/auth/password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword": "password123", "newPassword": "newpassword456"}'
```

