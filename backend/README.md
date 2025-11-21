# Driving School Management System - Backend

## Overview

This is a **Driving School Management System** backend that helps manage:
- **Students** - People learning to drive
- **Instructors** - Teachers who give lessons
- **Vehicles** - Cars used for lessons
- **Lessons** - Scheduled driving lessons
- **Payments** - Financial transactions
- **Admins** - System administrators
- **Settings** - System configuration

## Let's Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

### Installation

1. **Clone the repository**
```bash
  git clone https://github.com/Abderrahamane/driving-school-management
  cd backend
```

2. **Install dependencies**
```bash
  npm install
```

3. **Configure environment variables**
```bash
  cp .env.example .env
  # Edit .env with your configuration
```

4. **Start the server**
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```
the server will start on port `5000` by default.
http://localhost:5000/api/v1

### Health Check
```bash
  curl http://localhost:5000/health
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database connection setup
│   ├── controllers/     # Business logic for each feature
│   ├── middleware/      # Authentication & validation
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoint definitions
│   └── server.js        # Main entry point
├── docs/                # Detailed documentation
│   ├── architecture/    # System architecture docs
│   ├── api/            # API endpoint documentation
│   ├── models/         # Database model documentation
│   └── guides/         # Development guides
├── .env.example         # Example environment variables
├── package.json         # Project dependencies
└── README.md           # This file
```

## Documentation 

### For Developers
- [Architecture Overview](./docs/architecture/OVERVIEW.md)
- [Request Flow](./docs/architecture/REQUEST_FLOW.md)
- [Folder Structure](./docs/architecture/FOLDER_STRUCTURE.md)

### For Frontend Developers
- [API Usage Guide](./docs/guides/FRONTEND_GUIDE.md)
- [Authentication](./docs/guides/AUTHENTICATION.md)
- [Common Use Cases](./docs/guides/USE_CASES.md)

### API Documentation
- [Authentication API](./docs/api/AUTH.md)
- [Students API](./docs/api/STUDENTS.md)
- [Instructors API](./docs/api/INSTRUCTORS.md)
- [Vehicles API](./docs/api/VEHICLES.md)
- [Lessons API](./docs/api/LESSONS.md)
- [Payments API](./docs/api/PAYMENTS.md)
- [Settings API](./docs/api/SETTINGS.md)

### Models Documentation
- [Admin Model](./docs/models/ADMIN.md)
- [Student Model](./docs/models/STUDENT.md)
- [Instructor Model](./docs/models/INSTRUCTOR.md)
- [Vehicle Model](./docs/models/VEHICLE.md)
- [Lesson Model](./docs/models/LESSON.md)
- [Payment Model](./docs/models/PAYMENT.md)

## Technologies Used

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcrypt.js** - Password hashing
- **CORS** - Cross-origin requests
- **Dotenv** - Environment variables

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Environment variables for sensitive data
- Input validation and sanitization
- CORS enabled for specified origins

## API Endpoints

Base URL: `http://localhost:5000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login admin |
| POST | `/auth/register` | Register admin |
| GET | `/students` | Get all students |
| POST | `/students` | Create student |
| GET | `/lessons` | Get all lessons |
| POST | `/lessons` | Schedule lesson |
| ... | ... | [See full API docs](./docs/api/) |

##  Testing

### 1. using Postman (see Youtube video tutorials)

### 2. using curl:
```bash
# Using curl
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

See [Testing Guide](./docs/guides/TESTING.md) for more examples.

## Troubleshooting

Common issues and solutions can be found in the [Troubleshooting Guide](./docs/guides/TROUBLESHOOTING.md).

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an **issue** on **GitHub** or contact the development team.

---

**Happy Coding!**