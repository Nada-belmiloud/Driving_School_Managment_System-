# Settings API Documentation

Base URL: `/api/v1/settings`

All endpoints require authentication (include `Authorization: Bearer <token>` header).

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all settings |
| PUT | `/profile` | Update profile information |
| GET | `/notifications` | Get notification settings |
| PUT | `/notifications` | Update notification settings |
| GET | `/appearance` | Get appearance settings |
| PUT | `/appearance` | Update appearance settings |
| GET | `/security` | Get security settings |
| POST | `/security/two-factor` | Toggle two-factor authentication |
| DELETE | `/security/sessions/:sessionId` | End a session |
| GET | `/backups` | Get backup settings and history |
| PUT | `/backups/preferences` | Update backup preferences |
| POST | `/backups` | Create manual backup |
| POST | `/backups/:backupId/restore` | Restore from backup |
| GET | `/backups/:backupId/download` | Download backup |
| GET | `/system` | Get system status |
| POST | `/system/clear-cache` | Clear system cache |
| POST | `/system/optimize-database` | Optimize database |
| POST | `/system/export-logs` | Export system logs |

---

## Get All Settings

Get all settings for the current admin.

### Request

```http
GET /api/v1/settings
```

### Response

```json
{
  "success": true,
  "data": {
    "profile": {
      "name": "John Admin",
      "email": "john@admin.com",
      "role": "admin"
    },
    "notificationSettings": {
      "emailEnabled": true,
      "emailNewStudent": true,
      "emailLessonReminder": true,
      "emailPaymentReceived": true,
      "smsEnabled": false,
      "pushEnabled": true,
      "inAppEnabled": true
    },
    "appearanceSettings": {
      "theme": "light",
      "fontSize": "medium",
      "colorScheme": "blue",
      "sidebarPosition": "left",
      "compactMode": false
    },
    "securitySettings": {
      "twoFactorEnabled": false,
      "lastPasswordChange": "2024-01-01T00:00:00.000Z",
      "activeSessions": [
        {
          "_id": "64abc123",
          "device": "Chrome on Windows",
          "location": "Remote Session",
          "ipAddress": "192.168.1.1",
          "current": true,
          "lastActive": "2024-01-20T10:30:00.000Z",
          "createdAt": "2024-01-20T09:00:00.000Z"
        }
      ]
    },
    "backupSettings": {
      "automatic": true,
      "retentionDays": 30,
      "lastBackupAt": "2024-01-15T02:00:00.000Z"
    },
    "backups": [
      {
        "_id": "64pqr678",
        "type": "automatic",
        "status": "completed",
        "sizeMB": 245.5,
        "createdAt": "2024-01-15T02:00:00.000Z"
      }
    ]
  }
}
```

---

## Profile Settings

### Update Profile

Update admin's name and/or email.

#### Request

```http
PUT /api/v1/settings/profile
Content-Type: application/json
```

#### Request Body

```json
{
  "name": "John Updated",
  "email": "john.updated@admin.com"
}
```

#### Response

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "name": "John Updated",
    "email": "john.updated@admin.com",
    "role": "admin"
  }
}
```

#### Error Responses

**Email Already Exists**
```json
{
  "success": false,
  "error": "Another admin already uses this email"
}
```

---

## Notification Settings

### Get Notification Settings

Get all notification preferences.

#### Request

```http
GET /api/v1/settings/notifications
```

#### Response

```json
{
  "success": true,
  "data": {
    "emailEnabled": true,
    "emailNewStudent": true,
    "emailLessonReminder": true,
    "emailPaymentReceived": true,
    "emailSystemUpdate": false,
    "emailWeeklyReport": true,
    "smsEnabled": false,
    "smsLessonReminder": false,
    "smsPaymentDue": false,
    "smsEmergency": true,
    "pushEnabled": true,
    "pushNewStudent": true,
    "pushLessonStart": true,
    "pushPaymentReceived": true,
    "pushSystemAlert": true,
    "inAppEnabled": true,
    "inAppNewStudent": true,
    "inAppLessonUpdate": true,
    "inAppPayment": true,
    "inAppChat": true
  }
}
```

### Update Notification Settings

Update notification preferences.

#### Request

```http
PUT /api/v1/settings/notifications
Content-Type: application/json
```

#### Request Body

```json
{
  "emailNewStudent": false,
  "emailLessonReminder": true,
  "pushEnabled": true,
  "smsEnabled": false
}
```

**Note**: Only include settings you want to change. All values should be boolean.

#### Response

```json
{
  "success": true,
  "message": "Notification preferences updated successfully",
  "data": {
    "emailEnabled": true,
    "emailNewStudent": false,
    "emailLessonReminder": true,
    "pushEnabled": true,
    "smsEnabled": false
  }
}
```

---

## Appearance Settings

### Get Appearance Settings

Get UI appearance preferences.

#### Request

```http
GET /api/v1/settings/appearance
```

#### Response

```json
{
  "success": true,
  "data": {
    "theme": "light",
    "fontSize": "medium",
    "sidebarPosition": "left",
    "compactMode": false,
    "colorScheme": "blue",
    "showAnimations": true,
    "highContrast": false
  }
}
```

### Update Appearance Settings

Update UI appearance preferences.

#### Request

```http
PUT /api/v1/settings/appearance
Content-Type: application/json
```

#### Request Body

```json
{
  "theme": "dark",
  "fontSize": "large",
  "colorScheme": "purple",
  "compactMode": true
}
```

#### Allowed Values

| Setting | Allowed Values |
|---------|---------------|
| theme | light, dark, auto |
| fontSize | small, medium, large |
| colorScheme | blue, purple, green, red, orange |
| sidebarPosition | left, right |
| compactMode | true, false |
| showAnimations | true, false |
| highContrast | true, false |

#### Response

```json
{
  "success": true,
  "message": "Appearance settings updated successfully",
  "data": {
    "theme": "dark",
    "fontSize": "large",
    "colorScheme": "purple",
    "compactMode": true
  }
}
```

---

## Security Settings

### Get Security Settings

Get security configuration.

#### Request

```http
GET /api/v1/settings/security
```

#### Response

```json
{
  "success": true,
  "data": {
    "twoFactorEnabled": false,
    "lastPasswordChange": "2024-01-01T00:00:00.000Z",
    "activeSessions": [
      {
        "_id": "64abc123",
        "device": "Chrome on Windows",
        "userAgent": "Mozilla/5.0...",
        "location": "Remote Session",
        "ipAddress": "192.168.1.1",
        "current": true,
        "lastActive": "2024-01-20T10:30:00.000Z",
        "createdAt": "2024-01-20T09:00:00.000Z"
      },
      {
        "_id": "64abc124",
        "device": "Safari on iPhone",
        "location": "Remote Session",
        "ipAddress": "192.168.1.2",
        "current": false,
        "lastActive": "2024-01-19T15:20:00.000Z",
        "createdAt": "2024-01-19T14:00:00.000Z"
      }
    ]
  }
}
```

### Toggle Two-Factor Authentication

Enable or disable two-factor authentication.

#### Request

```http
POST /api/v1/settings/security/two-factor
Content-Type: application/json
```

#### Request Body

```json
{
  "enabled": true
}
```

#### Response

```json
{
  "success": true,
  "message": "Two-factor authentication enabled successfully",
  "data": {
    "twoFactorEnabled": true
  }
}
```

### End Session

Terminate a specific login session.

#### Request

```http
DELETE /api/v1/settings/security/sessions/:sessionId
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| sessionId | string | Session ID (MongoDB ObjectId) |

#### Response

```json
{
  "success": true,
  "message": "Session ended successfully"
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Session not found"
}
```

**Status Code**: 404

---

## Backup Settings

### Get Backup Settings

Get backup configuration and recent backups.

#### Request

```http
GET /api/v1/settings/backups
```

#### Response

```json
{
  "success": true,
  "data": {
    "settings": {
      "automatic": true,
      "retentionDays": 30,
      "lastBackupAt": "2024-01-15T02:00:00.000Z"
    },
    "backups": [
      {
        "_id": "64pqr678",
        "admin": "64abc123",
        "type": "automatic",
        "status": "completed",
        "sizeMB": 245.5,
        "retentionDays": 30,
        "notes": null,
        "restoredAt": null,
        "createdAt": "2024-01-15T02:00:00.000Z",
        "updatedAt": "2024-01-15T02:15:00.000Z"
      },
      {
        "_id": "64pqr679",
        "type": "manual",
        "status": "completed",
        "sizeMB": 240.2,
        "retentionDays": 30,
        "notes": "Pre-upgrade backup",
        "createdAt": "2024-01-10T10:30:00.000Z"
      }
    ]
  }
}
```

### Update Backup Preferences

Update backup settings.

#### Request

```http
PUT /api/v1/settings/backups/preferences
Content-Type: application/json
```

#### Request Body

```json
{
  "automatic": true,
  "retentionDays": 60
}
```

#### Response

```json
{
  "success": true,
  "message": "Backup preferences updated successfully",
  "data": {
    "automatic": true,
    "retentionDays": 60,
    "lastBackupAt": "2024-01-15T02:00:00.000Z"
  }
}
```

### Create Manual Backup

Create a new backup immediately.

#### Request

```http
POST /api/v1/settings/backups
Content-Type: application/json
```

#### Request Body

```json
{
  "type": "manual",
  "notes": "Pre-deployment backup"
}
```

#### Response

```json
{
  "success": true,
  "message": "Backup created successfully",
  "data": {
    "_id": "64pqr680",
    "admin": "64abc123",
    "type": "manual",
    "status": "completed",
    "sizeMB": 247.3,
    "retentionDays": 30,
    "notes": "Pre-deployment backup",
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

**Status Code**: 201

### Restore from Backup

Restore system from a previous backup.

#### Request

```http
POST /api/v1/settings/backups/:backupId/restore
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| backupId | string | Backup ID (MongoDB ObjectId) |

#### Response

```json
{
  "success": true,
  "message": "Backup restoration has been initiated",
  "data": {
    "_id": "64pqr678",
    "type": "automatic",
    "status": "restored",
    "sizeMB": 245.5,
    "restoredAt": "2024-01-20T11:00:00.000Z",
    "createdAt": "2024-01-15T02:00:00.000Z"
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Backup not found"
}
```

**Status Code**: 404

### Download Backup

Generate download link for a backup.

#### Request

```http
GET /api/v1/settings/backups/:backupId/download
```

#### Response

```json
{
  "success": true,
  "message": "Download link generated successfully",
  "data": {
    "backupId": "64pqr678",
    "downloadUrl": "/api/v1/settings/backups/64pqr678/download",
    "sizeMB": 245.5
  }
}
```

---

## System Settings

### Get System Status

Get system information and health status.

#### Request

```http
GET /api/v1/settings/system
```

#### Response

```json
{
  "success": true,
  "data": {
    "version": "v1.0.0",
    "lastUpdate": "2024-01-15T00:00:00.000Z",
    "dbStatus": "Connected",
    "apiStatus": "Operational",
    "uptime": "3 days, 5 hours, 23 minutes",
    "totals": {
      "users": 5,
      "students": 150,
      "lessons": 1250,
      "instructors": 25,
      "vehicles": 15,
      "paymentsAmount": 187500.00
    },
    "storage": {
      "used": 2.4,
      "total": 10,
      "unit": "GB"
    },
    "performance": {
      "cpu": 25,
      "memory": 45,
      "disk": 24
    },
    "recentActivity": [
      {
        "action": "Student Registered: John Doe",
        "time": "2024-01-20T10:30:00.000Z",
        "status": "success"
      },
      {
        "action": "Lesson Scheduled",
        "time": "2024-01-20T10:25:00.000Z",
        "status": "success"
      },
      {
        "action": "Payment Recorded (150.00 card)",
        "time": "2024-01-20T10:20:00.000Z",
        "status": "paid"
      },
      {
        "action": "Backup Completed",
        "time": "2024-01-20T02:00:00.000Z",
        "status": "completed"
      }
    ]
  }
}
```

### Clear System Cache

Clear the system cache.

#### Request

```http
POST /api/v1/settings/system/clear-cache
```

#### Response

```json
{
  "success": true,
  "message": "System cache cleared successfully"
}
```

### Optimize Database

Run database optimization.

#### Request

```http
POST /api/v1/settings/system/optimize-database
```

#### Response

```json
{
  "success": true,
  "message": "Database optimization completed successfully"
}
```

### Export System Logs

Export system logs for debugging.

#### Request

```http
POST /api/v1/settings/system/export-logs
```

#### Response

```json
{
  "success": true,
  "message": "System logs export started successfully"
}
```

---

## Data Models

### Notification Settings Object

```typescript
{
  emailEnabled: boolean,
  emailNewStudent: boolean,
  emailLessonReminder: boolean,
  emailPaymentReceived: boolean,
  emailSystemUpdate: boolean,
  emailWeeklyReport: boolean,
  smsEnabled: boolean,
  smsLessonReminder: boolean,
  smsPaymentDue: boolean,
  smsEmergency: boolean,
  pushEnabled: boolean,
  pushNewStudent: boolean,
  pushLessonStart: boolean,
  pushPaymentReceived: boolean,
  pushSystemAlert: boolean,
  inAppEnabled: boolean,
  inAppNewStudent: boolean,
  inAppLessonUpdate: boolean,
  inAppPayment: boolean,
  inAppChat: boolean
}
```

### Appearance Settings Object

```typescript
{
  theme: 'light' | 'dark' | 'auto',
  fontSize: 'small' | 'medium' | 'large',
  sidebarPosition: 'left' | 'right',
  compactMode: boolean,
  colorScheme: 'blue' | 'purple' | 'green' | 'red' | 'orange',
  showAnimations: boolean,
  highContrast: boolean
}
```

### Security Settings Object

```typescript
{
  twoFactorEnabled: boolean,
  lastPasswordChange: Date,
  activeSessions: Session[]
}
```

### Session Object

```typescript
{
  _id: string,
  device: string,
  userAgent: string,
  location: string,
  ipAddress: string,
  current: boolean,
  lastActive: Date,
  createdAt: Date
}
```

### Backup Settings Object

```typescript
{
  automatic: boolean,
  retentionDays: number,
  lastBackupAt: Date
}
```

---

## Validation Rules

### Profile
- Name: minimum 2 characters
- Email: valid email format, unique

### Backup Retention Days
- Must be a positive number
- Recommended: 7-365 days

### Theme
- One of: light, dark, auto

### Font Size
- One of: small, medium, large

### Color Scheme
- One of: blue, purple, green, red, orange

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid data or validation error |
| 401 | Unauthorized | Missing or invalid token |
| 404 | Not Found | Setting, backup, or session not found |
| 500 | Server Error | Internal server error |

---

## Related Endpoints

- [Authentication API](./AUTH.md) - For password changes
- [Admin Model](../models/ADMIN.md) - Admin model documentation
- [Backup Model](../models/BACKUP.md) - Backup model documentation

---

## cURL Examples

### Update Profile
```bash
curl -X PUT http://localhost:5000/api/v1/settings/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "email": "john.updated@admin.com"
  }'
```

### Update Notification Settings
```bash
curl -X PUT http://localhost:5000/api/v1/settings/notifications \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "emailNewStudent": true,
    "pushEnabled": true
  }'
```

### Create Manual Backup
```bash
curl -X POST http://localhost:5000/api/v1/settings/backups \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "manual",
    "notes": "Pre-deployment backup"
  }'
```

### Get System Status
```bash
curl -X GET http://localhost:5000/api/v1/settings/system \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

For more examples, see the [Frontend Guide](../guides/FRONTEND_GUIDE.md).