# Settings API Documentation

Base URL: `/api/v1/settings`

All endpoints require authentication (include `Authorization: Bearer <token>` header).

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get current settings/profile |
| PUT | `/name` | Update admin name |
| PUT | `/email` | Update admin email |
| PUT | `/password` | Update admin password |

---

## Get Settings

Get current admin profile and settings.

### Request

```http
GET /api/v1/settings
Authorization: Bearer <token>
```

### Response

```json
{
  "success": true,
  "data": {
    "profile": {
      "name": "Admin Name",
      "email": "admin@drivingschool.com"
    },
    "lastPasswordChange": "2024-01-10T15:30:00.000Z"
  }
}
```

---

## Update Name

Update admin's display name.

### Request

```http
PUT /api/v1/settings/name
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

### Error Response

**Name Too Short**
```json
{
  "success": false,
  "error": "Name must be at least 2 characters"
}
```
**Status Code**: 400

---

## Update Email

Update admin's email address.

### Request

```http
PUT /api/v1/settings/email
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

### Error Responses

**Missing Email**
```json
{
  "success": false,
  "error": "Please provide new email"
}
```
**Status Code**: 400

**Missing Password**
```json
{
  "success": false,
  "error": "Please provide current password to confirm"
}
```
**Status Code**: 400

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

Update admin's password.

### Request

```http
PUT /api/v1/settings/password
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

### Error Responses

**Missing Passwords**
```json
{
  "success": false,
  "error": "Please provide current and new password"
}
```
**Status Code**: 400

**Password Too Short**
```json
{
  "success": false,
  "error": "New password must be at least 6 characters"
}
```
**Status Code**: 400

**Incorrect Current Password**
```json
{
  "success": false,
  "error": "Current password is incorrect"
}
```
**Status Code**: 401

---

## cURL Examples

### Get Settings
```bash
curl -X GET http://localhost:5000/api/v1/settings \
  -H "Authorization: Bearer <token>"
```

### Update Name
```bash
curl -X PUT http://localhost:5000/api/v1/settings/name \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Admin Name"}'
```

### Update Email
```bash
curl -X PUT http://localhost:5000/api/v1/settings/email \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"email": "newemail@drivingschool.com", "password": "currentpassword"}'
```

### Update Password
```bash
curl -X PUT http://localhost:5000/api/v1/settings/password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword": "oldpassword", "newPassword": "newpassword123"}'
```

