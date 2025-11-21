# Admin Model Documentation

## Overview

The Admin model represents administrators who manage the driving school system. Admins can log in, manage students, instructors, vehicles, lessons, and configure system settings.

## Schema Definition

```javascript
const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
  lastLogin: Date,
  notificationSettings: Object,
  appearanceSettings: Object,
  securitySettings: Object,
  backupSettings: Object,
  sessions: Array
}, {
  timestamps: true
});
```

## Fields

### Basic Information

#### `name`
- **Type**: String
- **Required**: Yes
- **Description**: Admin's full name
- **Validation**: Minimum 2 characters
- **Example**: `"Nada Belmiloud"`

#### `email`
- **Type**: String
- **Required**: Yes
- **Unique**: Yes
- **Lowercase**: Yes (automatically converted)
- **Description**: Admin's email address used for login
- **Validation**: Must be valid email format
- **Example**: `"admin@drivingschool.com"`

#### `password`
- **Type**: String
- **Required**: Yes
- **Description**: Hashed password (never stored in plain text)
- **Validation**: Minimum 6 characters
- **Security**:
    - Automatically hashed using bcrypt before saving
    - Not returned in API responses by default
    - Salt rounds: 10
- **Example**: `"$2a$10$xyz..."` (hashed)

#### `role` note: we don't need this now because there is only one type on admins
- **Type**: String
- **Required**: Yes
- **Enum**: `['admin', 'super-admin']`
- **Default**: `'admin'`
- **Description**: Admin's role/permission level
- **Permissions**:
    - `admin`: Standard admin privileges
    - `super-admin`: Full system access including user management

#### `isActive`
- **Type**: Boolean
- **Default**: `true`
- **Description**: Whether the admin account is active
- **Usage**:
    - `true`: Admin can log in
    - `false`: Admin is disabled and cannot log in

#### `lastLogin`
- **Type**: Date
- **Description**: Timestamp of last successful login
- **Auto-updated**: Yes (on login)
- **Example**: `"2024-01-15T10:30:00.000Z"`

---

### Notification Settings

#### `notificationSettings`
```javascript
{
  emailNewStudent: Boolean,        // Email when new student registers
  emailLessonReminder: Boolean,    // Email lesson reminders
  emailPaymentReceived: Boolean,   // Email when payment received
  smsEnabled: Boolean,             // Enable SMS notifications
  pushEnabled: Boolean,            // Enable push notifications
  emailDigest: String              // "daily", "weekly", "never"
}
```

**Defaults**:
```javascript
{
  emailNewStudent: true,
  emailLessonReminder: true,
  emailPaymentReceived: true,
  smsEnabled: false,
  pushEnabled: true,
  emailDigest: "daily"
}
```

---

### Appearance Settings

#### `appearanceSettings`
```javascript
{
  theme: String,           // "light", "dark", "auto"
  fontSize: String,        // "small", "medium", "large"
  colorScheme: String,     // "blue", "green", "purple", "red"
  sidebarCollapsed: Boolean,
  language: String         // "en", "es", "fr", etc.
}
```

**Defaults**:
```javascript
{
  theme: "light",
  fontSize: "medium",
  colorScheme: "blue",
  sidebarCollapsed: false,
  language: "en"
}
```

---

### Security Settings

#### `securitySettings`
```javascript
{
  twoFactorEnabled: Boolean,
  twoFactorSecret: String,
  lastPasswordChange: Date,
  sessionTimeout: Number,      // Minutes
  allowMultipleSessions: Boolean,
  ipWhitelist: [String]
}
```

**Defaults**:
```javascript
{
  twoFactorEnabled: false,
  twoFactorSecret: null,
  lastPasswordChange: Date.now(),
  sessionTimeout: 60,
  allowMultipleSessions: true,
  ipWhitelist: []
}
```

---

### Backup Settings

#### `backupSettings`
```javascript
{
  automatic: Boolean,
  frequency: String,         // "daily", "weekly", "monthly"
  retentionDays: Number,     // How long to keep backups
  lastBackupAt: Date
}
```

**Defaults**:
```javascript
{
  automatic: true,
  frequency: "weekly",
  retentionDays: 30,
  lastBackupAt: null
}
```

---

### Sessions

#### `sessions` (Array of Session Objects)
Tracks active login sessions for the admin.

```javascript
{
  token: String,              // JWT token identifier
  device: String,             // "Chrome on Windows"
  ip: String,                 // IP address
  location: String,           // "New York, US"
  lastActivity: Date,
  createdAt: Date
}
```

**Purpose**:
- Track where admin is logged in
- Allow admin to view and terminate sessions
- Security monitoring

---

### Timestamps

#### `createdAt`
- **Type**: Date
- **Auto-generated**: Yes
- **Description**: When the admin account was created

#### `updatedAt`
- **Type**: Date
- **Auto-generated**: Yes
- **Description**: When the admin account was last updated

---

## Methods

### Instance Methods

#### `comparePassword(candidatePassword)`
Compares a plain text password with the hashed password.

```javascript
const isMatch = await admin.comparePassword('password123');
```

**Parameters**:
- `candidatePassword` (String): Plain text password to compare

**Returns**: Boolean - `true` if password matches, `false` otherwise

**Usage**:
```javascript
// During login
const admin = await Admin.findOne({ email }).select('+password');
const isPasswordCorrect = await admin.comparePassword(password);

if (!isPasswordCorrect) {
  throw new Error('Invalid credentials');
}
```

---

## Middleware (Hooks)

### Pre-save Hook - Password Hashing

Automatically hashes password before saving to database.

```javascript
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
```

**Behavior**:
- Only runs when password is modified
- Uses bcrypt with 10 salt rounds
- Plain text password → Hashed password

**Example**:
```javascript
const admin = new Admin({
  name: 'John',
  email: 'john@admin.com',
  password: 'password123'  // Plain text
});

await admin.save();
// Password is now: "$2a$10$xyz..." (hashed)
```

---

## Indexes

### Unique Index on Email
```javascript
adminSchema.index({ email: 1 }, { unique: true });
```

**Purpose**:
- Ensures no duplicate email addresses
- Faster email lookups during login

---

## Validation Rules

### Name
- **Required**: Yes
- **Min Length**: 2 characters
- **Max Length**: 100 characters
- **Error**: "Name must be between 2 and 100 characters"

### Email
- **Required**: Yes
- **Format**: Valid email
- **Unique**: Yes
- **Case**: Lowercase (auto-converted)
- **Error**: "Please provide a valid email"

### Password
- **Required**: Yes
- **Min Length**: 6 characters
- **Select**: false (not returned by default)
- **Error**: "Password must be at least 6 characters"

### Role
- **Required**: Yes
- **Enum**: ['admin', 'super-admin']
- **Default**: 'admin'
- **Error**: "Role must be either admin or super-admin"

---

## Security Features

### 1. Password Hashing
```javascript
// Plain text: "password123"
// Stored: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
```

**Benefits**:
- Original password cannot be recovered
- Same password produces different hashes
- Computationally expensive to crack

### 2. Password Field Hidden
```javascript
// Default query
const admin = await Admin.findById(id);
console.log(admin.password); // undefined

// Explicitly include password
const admin = await Admin.findById(id).select('+password');
console.log(admin.password); // "$2a$10$xyz..."
```

### 3. Session Tracking
```javascript
// Track login sessions
admin.sessions.push({
  token: tokenId,
  device: 'Chrome on Windows',
  ip: req.ip,
  location: 'New York, US',
  lastActivity: new Date(),
  createdAt: new Date()
});
```

### 4. Two-Factor Authentication
```javascript
if (admin.securitySettings.twoFactorEnabled) {
  // Verify 2FA code
  const verified = verifyTOTP(
    admin.securitySettings.twoFactorSecret,
    userProvidedCode
  );
}
```

---

## Example Usage

### Create Admin

```javascript
const admin = await Admin.create({
  name: 'Nada Belmiloud',
  email: 'Nada@admin.com',
  password: 'password123',  // Will be hashed automatically
  role: 'admin'
});

console.log(admin.password); // undefined (hidden by default)
```

### Login Admin

```javascript
// Find admin with password field
const admin = await Admin.findOne({ email: 'Nada@admin.com' })
  .select('+password');

// Check if admin exists
if (!admin) {
  throw new Error('Admin not found');
}

// Check if account is active
if (!admin.isActive) {
  throw new Error('Account is disabled');
}

// Verify password
const isPasswordCorrect = await admin.comparePassword('password123');

if (!isPasswordCorrect) {
  throw new Error('Invalid password');
}

// Update last login
admin.lastLogin = new Date();
await admin.save();

// Generate JWT token
const token = jwt.sign(
  { id: admin._id, role: admin.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

### Update Settings

```javascript
// Update notification settings
await Admin.findByIdAndUpdate(adminId, {
  'notificationSettings.emailNewStudent': true,
  'notificationSettings.emailDigest': 'weekly'
});

// Update appearance
await Admin.findByIdAndUpdate(adminId, {
  'appearanceSettings.theme': 'dark',
  'appearanceSettings.fontSize': 'large'
});
```

### Add Session

```javascript
const admin = await Admin.findById(adminId);

admin.sessions.push({
  token: tokenIdentifier,
  device: req.headers['user-agent'],
  ip: req.ip,
  location: 'New York, US',
  lastActivity: new Date(),
  createdAt: new Date()
});

await admin.save();
```

### Remove Old Sessions

```javascript
const admin = await Admin.findById(adminId);

// Remove sessions older than 30 days
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

admin.sessions = admin.sessions.filter(
  session => session.lastActivity > thirtyDaysAgo
);

await admin.save();
```

---

## Common Queries

### Find Active Admins
```javascript
const activeAdmins = await Admin.find({ isActive: true });
```

### Find Super Admins
```javascript
const superAdmins = await Admin.find({ role: 'super-admin' });
```

### Find Admins Who Haven't Logged In Recently
```javascript
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const inactiveAdmins = await Admin.find({
  lastLogin: { $lt: thirtyDaysAgo }
});
```

### Count Admins by Role
```javascript
const counts = await Admin.aggregate([
  {
    $group: {
      _id: '$role',
      count: { $sum: 1 }
    }
  }
]);
// Result: [{ _id: 'admin', count: 10 }, { _id: 'super-admin', count: 2 }]
```

---

## Best Practices

### 1. Never Store Plain Passwords
```javascript
// BAD
const admin = new Admin({
  password: 'password123'
});
// Save without hashing

// GOOD
const admin = new Admin({
  password: 'password123'
});
await admin.save(); // Pre-save hook hashes password
```

### 2. Always Select Password Explicitly
```javascript
// BAD
const admin = await Admin.findById(id);
const match = await admin.comparePassword(password); // Error: password is undefined

// GOOD
const admin = await Admin.findById(id).select('+password');
const match = await admin.comparePassword(password);
```

### 3. Update Last Login
```javascript
// Always update after successful login
admin.lastLogin = new Date();
await admin.save();
```

### 4. Clean Up Old Sessions
```javascript
// Periodically remove inactive sessions
if (admin.sessions.length > 10) {
  admin.sessions = admin.sessions
    .sort((a, b) => b.lastActivity - a.lastActivity)
    .slice(0, 5); // Keep only 5 most recent
  await admin.save();
}
```

---

## Related Models

- **Backup Model**: Tracks backups created by admins
- **Student Model**: Students managed by admins
- **Instructor Model**: Instructors managed by admins

## Related Endpoints

- [Authentication API](../api/AUTH.md)
- [Settings API](../api/SETTINGS.md)

---

## Database Collection

**Collection Name**: `admins`

**Example Document**:
```json
{
  "_id": "64abc123def456789",
  "name": "John Admin",
  "email": "john@admin.com",
  "password": "$2a$10$xyz...",
  "role": "admin",
  "isActive": true,
  "lastLogin": "2024-01-15T10:30:00.000Z",
  "notificationSettings": {
    "emailNewStudent": true,
    "emailLessonReminder": true,
    "emailPaymentReceived": true,
    "smsEnabled": false,
    "pushEnabled": true,
    "emailDigest": "daily"
  },
  "appearanceSettings": {
    "theme": "dark",
    "fontSize": "medium",
    "colorScheme": "blue",
    "sidebarCollapsed": false,
    "language": "en"
  },
  "securitySettings": {
    "twoFactorEnabled": false,
    "sessionTimeout": 60,
    "allowMultipleSessions": true
  },
  "backupSettings": {
    "automatic": true,
    "frequency": "weekly",
    "retentionDays": 30
  },
  "sessions": [
    {
      "token": "abc123",
      "device": "Chrome on Windows",
      "ip": "192.168.1.1",
      "location": "New York, US",
      "lastActivity": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-15T09:00:00.000Z"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```