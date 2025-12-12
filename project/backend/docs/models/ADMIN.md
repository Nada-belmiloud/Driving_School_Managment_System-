# Admin Model

The Admin model represents an administrator who can access the system.

## Schema

```javascript
{
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false  // Don't return password by default
  },
  lastPasswordChange: {
    type: Date
  }
}
```

## Fields Description

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | Yes | Admin's display name (min 2 characters) |
| email | String | Yes | Unique email address |
| password | String | Yes | Hashed password (min 6 characters) |
| lastPasswordChange | Date | No | When password was last changed |

## Instance Methods

### comparePassword(candidatePassword)

Compares a plain text password with the stored hashed password.

```javascript
const isMatch = await admin.comparePassword('plainTextPassword');
// Returns: true or false
```

## Pre-save Middleware

### Password Hashing

Passwords are automatically hashed before saving using bcrypt with 10 salt rounds:

```javascript
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

## Security Features

- **Password Selection**: Password field has `select: false`, meaning it won't be returned in queries by default
- **Bcrypt Hashing**: Passwords are hashed with bcrypt using 10 salt rounds
- **Email Normalization**: Emails are automatically converted to lowercase

## Example Document

```json
{
  "_id": "64admin123def456789",
  "name": "Admin User",
  "email": "admin@drivingschool.com",
  "lastPasswordChange": "2024-01-10T15:30:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-10T15:30:00.000Z"
}
```

**Note**: The `password` field is not included in the response due to `select: false`.

## Seeding Admin User

To create an initial admin user, run:

```bash
npm run seed:admin
```

This will create an admin with:
- Email: admin@drivingschool.com
- Password: password123 (change this in production!)

