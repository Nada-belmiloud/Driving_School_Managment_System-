# Documentation Index

Complete documentation for the Driving School Management System Backend.

## Navigation

### Getting Started
- [Main README](../README.md) - Project overview and quick start
- [Architecture Overview](./architecture/OVERVIEW.md) - System architecture
- [Request Flow](./architecture/REQUEST_FLOW.md) - How requests are processed

### For Frontend Developers
- [Frontend Guide](./guides/FRONTEND_GUIDE.md) - **START HERE** - Complete integration guide
- [Authentication Guide](./guides/AUTHENTICATION.md) - Login and security
- [Common Use Cases](./guides/USE_CASES.md) - Real-world examples

---

## Documentation Structure

```
docs/
├── INDEX.md                    # This file
├── architecture/               # System architecture
│   ├── OVERVIEW.md            # High-level architecture
│   ├── REQUEST_FLOW.md        # Request processing flow
│   ├── FOLDER_STRUCTURE.md    # Project organization
│   └── TECHNOLOGIES.md        # Tech stack details
├── api/                       # API endpoint documentation
│   ├── AUTH.md               # Authentication endpoints
│   ├── STUDENTS.md           # Students management
│   ├── INSTRUCTORS.md        # Instructors management
│   ├── VEHICLES.md           # Vehicles management
│   ├── LESSONS.md            # Lessons scheduling
│   ├── PAYMENTS.md           # Payments processing
│   └── SETTINGS.md           # System settings
├── models/                    # Database models
│   ├── ADMIN.md              # Admin user model
│   ├── STUDENT.md            # Student model
│   ├── INSTRUCTOR.md         # Instructor model
│   ├── VEHICLE.md            # Vehicle model
│   ├── LESSON.md             # Lesson model
│   ├── PAYMENT.md            # Payment model
│   └── BACKUP.md             # Backup model
└── guides/                    # Developer guides
    ├── FRONTEND_GUIDE.md     # Frontend integration
    ├── AUTHENTICATION.md     # Auth implementation
    ├── USE_CASES.md          # Example scenarios
    ├── ERROR_HANDLING.md     # Error handling
    ├── TESTING.md            # Testing guide
    └── TROUBLESHOOTING.md    # Common issues
```

---

##  Architecture Documentation

### Overview
- **File**: [architecture/OVERVIEW.md](./architecture/OVERVIEW.md)
- **Topics**:
    - High-level architecture diagram
    - Component responsibilities
    - Design patterns (MVC, Middleware)
    - Security architecture
    - Technology stack

### Request Flow
- **File**: [architecture/REQUEST_FLOW.md](./architecture/REQUEST_FLOW.md)
- **Topics**:
    - Complete request/response cycle
    - Step-by-step flow diagrams
    - Middleware chain
    - Error flow
    - Performance considerations

---

##  API Documentation

### Authentication API
- **File**: [api/AUTH.md](./api/AUTH.md)
- **Endpoints**:
    - `POST /auth/register` - Register new admin
    - `POST /auth/login` - Login admin
    - `GET /auth/me` - Get current user
    - `PUT /auth/updatepassword` - Change password
    - `POST /auth/logout` - Logout

### Students API
- **File**: [api/STUDENTS.md](./api/STUDENTS.md)
- **Endpoints**:
    - `GET /students` - List students
    - `GET /students/stats` - Statistics
    - `GET /students/:id` - Get student
    - `POST /students` - Create student
    - `PUT /students/:id` - Update student
    - `DELETE /students/:id` - Delete student

### Instructors API
- **File**: [api/INSTRUCTORS.md](./api/INSTRUCTORS.md)
- **Endpoints**:
    - `GET /instructors` - List instructors
    - `GET /instructors/stats` - Statistics
    - `GET /instructors/:id` - Get instructor
    - `GET /instructors/:id/schedule` - Get schedule
    - `POST /instructors` - Create instructor
    - `PUT /instructors/:id` - Update instructor
    - `DELETE /instructors/:id` - Delete instructor

### Vehicles API
- **File**: [api/VEHICLES.md](./api/VEHICLES.md)
- **Endpoints**:
    - `GET /vehicles` - List vehicles
    - `GET /vehicles/stats` - Statistics
    - `GET /vehicles/:id` - Get vehicle
    - `GET /vehicles/:id/availability` - Check availability
    - `GET /vehicles/:id/maintenance` - Maintenance history
    - `POST /vehicles` - Create vehicle
    - `POST /vehicles/:id/maintenance` - Add maintenance
    - `PUT /vehicles/:id` - Update vehicle
    - `PATCH /vehicles/:id/mileage` - Update mileage
    - `DELETE /vehicles/:id` - Delete vehicle

### Lessons API
- **File**: [api/LESSONS.md](./api/LESSONS.md)
- **Endpoints**:
    - `GET /lessons` - List lessons
    - `GET /lessons/stats` - Statistics
    - `GET /lessons/calendar` - Calendar view
    - `GET /lessons/upcoming` - Upcoming lessons
    - `GET /lessons/:id` - Get lesson
    - `POST /lessons` - Schedule lesson
    - `POST /lessons/check-availability` - Check availability
    - `POST /lessons/bulk-schedule` - Bulk scheduling
    - `PUT /lessons/:id` - Update lesson
    - `PUT /lessons/:id/complete` - Complete lesson
    - `DELETE /lessons/:id` - Cancel lesson

### Payments API
- **File**: [api/PAYMENTS.md](./api/PAYMENTS.md)
- **Endpoints**:
    - `GET /payments` - List payments
    - `GET /payments/stats` - Statistics
    - `GET /payments/pending` - Pending payments
    - `GET /payments/student/:studentId` - Student payments
    - `GET /payments/:id` - Get payment
    - `POST /payments` - Create payment
    - `PUT /payments/:id` - Update payment
    - `PUT /payments/:id/mark-paid` - Mark as paid
    - `DELETE /payments/:id` - Delete payment

### Settings API
- **File**: [api/SETTINGS.md](./api/SETTINGS.md)
- **Endpoints**:
    - `GET /settings` - Get all settings
    - `PUT /settings/profile` - Update profile
    - `GET /settings/notifications` - Get notifications
    - `PUT /settings/notifications` - Update notifications
    - `GET /settings/appearance` - Get appearance
    - `PUT /settings/appearance` - Update appearance
    - `GET /settings/security` - Get security settings
    - `POST /settings/security/two-factor` - Toggle 2FA
    - `DELETE /settings/security/sessions/:id` - End session
    - `GET /settings/backups` - Get backups
    - `POST /settings/backups` - Create backup
    - `POST /settings/backups/:id/restore` - Restore backup
    - `GET /settings/system` - System status

---

## Database Models

### Admin Model
- **File**: [models/ADMIN.md](./models/ADMIN.md)
- **Features**:
    - User authentication
    - Role-based permissions
    - Settings management
    - Session tracking
    - Password hashing
    - Two-factor authentication

### Student Model
- **File**: [models/STUDENT.md](./models/STUDENT.md)
- **Features**:
    - Student information
    - Progress tracking
    - License type
    - Status management
    - Age validation
    - Search indexes

### Instructor Model
- **File**: [models/INSTRUCTOR.md](./models/INSTRUCTOR.md)
- **Features**:
    - Instructor profiles
    - Availability scheduling
    - Specialization (manual/automatic)
    - Experience tracking
    - Emergency contacts
    - Status management

### Vehicle Model
- **File**: [models/VEHICLE.md](./models/VEHICLE.md)
- **Features**:
    - Vehicle information
    - Maintenance tracking
    - Availability status
    - Insurance details
    - Registration details
    - Mileage tracking
    - Maintenance history

### Lesson Model
- **File**: [models/LESSON.md](./models/LESSON.md)
- **Features**:
    - Lesson scheduling
    - Status tracking
    - Conflict detection
    - Student-instructor-vehicle linking
    - Rating system
    - Lesson types
    - Cancellation tracking

### Payment Model
- **File**: [models/PAYMENT.md](./models/PAYMENT.md)
- **Features**:
    - Payment tracking
    - Multiple payment methods
    - Receipt generation
    - Payment status
    - Categories
    - Transaction tracking
    - Refund management

### Backup Model
- **File**: [models/BACKUP.md](./models/BACKUP.md)
- **Features**:
    - Backup tracking
    - Automatic/manual backups
    - Retention management
    - Restore history
    - Size tracking
    - Status monitoring

---

## Developer Guides

### Frontend Integration Guide
- **File**: [guides/FRONTEND_GUIDE.md](./guides/FRONTEND_GUIDE.md)
- **Topics**:
    - Authentication flow
    - Making API calls
    - API helper class
    - Error handling
    - React examples
    - Best practices

### Authentication Guide
- **File**: [guides/AUTHENTICATION.md](./guides/AUTHENTICATION.md)
- **Topics**:
    - JWT tokens
    - Login/logout flow
    - Token storage
    - Protected routes
    - Token refresh
    - Security best practices

### Common Use Cases
- **File**: [guides/USE_CASES.md](./guides/USE_CASES.md)
- **Topics**:
    - Student registration flow
    - Lesson scheduling
    - Payment processing
    - Report generation
    - Maintenance tracking
    - Complete workflows

### Error Handling
- **File**: [guides/ERROR_HANDLING.md](./guides/ERROR_HANDLING.md)
- **Topics**:
    - Error response format
    - HTTP status codes
    - Error middleware
    - Client-side handling
    - Logging
    - Debugging

### Testing Guide
- **File**: [guides/TESTING.md](./guides/TESTING.md)
- **Topics**:
    - Testing with Postman
    - cURL examples
    - Browser console testing
    - Unit testing
    - Integration testing
    - Test data

### Troubleshooting
- **File**: [guides/TROUBLESHOOTING.md](./guides/TROUBLESHOOTING.md)
- **Topics**:
    - Common errors
    - Connection issues
    - Authentication problems
    - Database errors
    - Performance issues
    - Debug techniques

---

## Quick Links by Role

### I'm a Frontend Developer
1. Start with [Frontend Guide](./guides/FRONTEND_GUIDE.md)
2. Review [Authentication Guide](./guides/AUTHENTICATION.md)
3. Check [API Documentation](./api/) for specific endpoints
4. See [Use Cases](./guides/USE_CASES.md) for examples

### I'm a Backend Developer
1. Read [Architecture Overview](./architecture/OVERVIEW.md)
2. Understand [Request Flow](./architecture/REQUEST_FLOW.md)
3. Study [Model Documentation](./models/)
4. Review [Error Handling](./guides/ERROR_HANDLING.md)

### I'm a New Team Member
1. Start with [Main README](../README.md)
2. Read [Architecture Overview](./architecture/OVERVIEW.md)
3. Follow [Frontend Guide](./guides/FRONTEND_GUIDE.md)
4. Try [Common Use Cases](./guides/USE_CASES.md)

### I Need to Fix a Bug
1. Check [Troubleshooting Guide](./guides/TROUBLESHOOTING.md)
2. Review [Error Handling](./guides/ERROR_HANDLING.md)
3. Check relevant [API Documentation](./api/)
4. See [Request Flow](./architecture/REQUEST_FLOW.md)

---

## Search Guide

### Looking for Specific Information?

**Authentication**:
- [Auth API](./api/AUTH.md)
- [Admin Model](./models/ADMIN.md)
- [Authentication Guide](./guides/AUTHENTICATION.md)

**Students**:
- [Students API](./api/STUDENTS.md)
- [Student Model](./models/STUDENT.md)

**Instructors**:
- [Instructors API](./api/INSTRUCTORS.md)
- [Instructor Model](./models/INSTRUCTOR.md)

**Vehicles**:
- [Vehicles API](./api/VEHICLES.md)
- [Vehicle Model](./models/VEHICLE.md)

**Lessons**:
- [Lessons API](./api/LESSONS.md)
- [Lesson Model](./models/LESSON.md)

**Payments**:
- [Payments API](./api/PAYMENTS.md)
- [Payment Model](./models/PAYMENT.md)

**System Settings**:
- [Settings API](./api/SETTINGS.md)
- [Admin Model](./models/ADMIN.md)
- [Backup Model](./models/BACKUP.md)

---

## Documentation Standards

All documentation follows these standards:

### API Documentation
- Complete endpoint description
- Request/response examples
- Query parameters
- Validation rules
- Error responses
- cURL examples

### Model Documentation
- Complete schema definition
- Field descriptions
- Validation rules
- Indexes
- Virtual fields
- Methods
- Common queries
- Aggregation examples
- Business logic
- Best practices

### Guides
- Step-by-step instructions
- Code examples
- Screenshots (where applicable)
- Common pitfalls
- Best practices
- Related resources

---

## Contributing to Documentation

When adding or updating documentation:

1. **Follow the existing structure**
2. **Include code examples**
3. **Add cross-references** to related docs
4. **Keep it up-to-date** with code changes
5. **Test all examples**
6. **Use clear headings** for easy navigation
7. **Add to this index** if creating new files

---

## Getting Help

- Check [Troubleshooting Guide](./guides/TROUBLESHOOTING.md)
- Review relevant API/Model documentation
- Check [Common Use Cases](./guides/USE_CASES.md)
- Open an issue on GitHub
- Contact the development team

---

## Documentation Updates

This documentation is updated regularly. Last major update: 16 November 2025 (after midterms week)

### Recent Changes
* Complete model documentation (done)
* API endpoint documentation (done)
* Frontend integration guide (done)
* Architecture documentation (done)
* Testing guide (in progress)
* Deployment guide (in progress)

---

**Happy Coding!**