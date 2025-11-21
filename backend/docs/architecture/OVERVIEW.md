# Backend Architecture Overview

## High-Level Architecture

```
┌─────────────┐
│   FRONTEND  │  (React/Vue/Angular)
│   (Client)  │
└──────┬──────┘
       │ HTTP Request (JSON)
       │
       ▼
┌─────────────────────────────────────────────┐
│          EXPRESS SERVER (Backend)            │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │        1. ROUTES                     │   │
│  │  (Define API endpoints)              │   │
│  │  /api/v1/students                    │   │
│  │  /api/v1/lessons                     │   │
│  └────────┬─────────────────────────────┘   │
│           │                                  │
│           ▼                                  │
│  ┌─────────────────────────────────────┐   │
│  │        2. MIDDLEWARE                 │   │
│  │  (Check authentication, validate)    │   │
│  │  - Verify JWT token                  │   │
│  │  - Validate request data             │   │
│  └────────┬─────────────────────────────┘   │
│           │                                  │
│           ▼                                  │
│  ┌─────────────────────────────────────┐   │
│  │        3. CONTROLLERS                │   │
│  │  (Handle business logic)             │   │
│  │  - Process request                   │   │
│  │  - Call model functions              │   │
│  └────────┬─────────────────────────────┘   │
│           │                                  │
│           ▼                                  │
│  ┌─────────────────────────────────────┐   │
│  │        4. MODELS                     │   │
│  │  (Database schemas)                  │   │
│  │  - Define data structure             │   │
│  │  - Interact with MongoDB             │   │
│  └────────┬─────────────────────────────┘   │
│           │                                  │
└───────────┼──────────────────────────────────┘
            │
            ▼
    ┌──────────────┐
    │   MONGODB    │  (Database)
    │   (Storage)  │
    └──────────────┘
```

## Components

### 1. Routes
**Purpose**: Define API endpoints and map them to controllers

**Responsibilities**:
- Define URL patterns
- Specify HTTP methods (GET, POST, PUT, DELETE)
- Apply middleware
- Connect to controller functions

**Example**:
```javascript
router.post("/students", protect, validateStudent, addStudent);
```

### 2. Middleware
**Purpose**: Functions that execute before reaching controllers

**Responsibilities**:
- Authentication (verify JWT tokens)
- Authorization (check user permissions)
- Input validation
- Error handling
- Request logging

**Types**:
- `protect` - Verify authentication
- `validateStudent` - Validate student data
- `authorize` - Check user roles
- `errorHandler` - Catch and format errors

### 3. Controllers
**Purpose**: Contain business logic for each feature

**Responsibilities**:
- Process incoming requests
- Validate business rules
- Interact with models
- Format responses
- Handle errors

**Example**:
```javascript
const addStudent = async (req, res, next) => {
  // 1. Get data from request
  // 2. Check business rules
  // 3. Save to database via model
  // 4. Return response
};
```

### 4. Models
**Purpose**: Define data structure and interact with database

**Responsibilities**:
- Define schemas (data structure)
- Set validation rules
- Create indexes for performance
- Define relationships
- Implement data methods

**Example**:
```javascript
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }
});
```

### 5. Database (MongoDB)
**Purpose**: Persist data

**Responsibilities**:
- Store documents
- Execute queries
- Enforce constraints (unique, required)
- Manage indexes
- Handle transactions

## Design Patterns

### MVC Pattern (Model-View-Controller)
- **Model**: Data structure and database logic
- **View**: (Frontend - separate application)
- **Controller**: Business logic and request handling

### Middleware Pattern
- Chain of functions that process requests
- Each middleware can:
    - Pass control to next middleware
    - Send response and end chain
    - Handle errors

### Repository Pattern
- Models act as repositories
- Abstract database operations
- Provide clean interface for controllers

## Data Flow

### Request Flow
```
Client → Route → Middleware → Controller → Model → Database
```

### Response Flow
```
Database → Model → Controller → Response → Client
```

## Security Architecture

### Authentication
- JWT (JSON Web Tokens) based
- Token generated on login
- Token verified on protected routes
- Token contains user ID and role

### Authorization
- Role-based access control
- Middleware checks user roles
- Different permissions for admin/super-admin

### Data Protection
- Passwords hashed with bcrypt
- Sensitive data in environment variables
- Input validation and sanitization
- CORS configured for specific origins

## Scalability Considerations

### Current Architecture
- Monolithic design
- Single database instance
- Stateless API (can scale horizontally)

### Future Improvements
- Microservices architecture
- Database replication
- Caching layer (Redis)
- Load balancing
- API rate limiting

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js | JavaScript runtime |
| Framework | Express.js | Web framework |
| Database | MongoDB | NoSQL database |
| ODM | Mongoose | MongoDB object modeling |
| Authentication | JWT | Token-based auth |
| Security | Bcrypt | Password hashing |
| CORS | cors | Cross-origin requests |
| Config | dotenv | Environment variables |

## Best Practices

1. **Separation of Concerns**: Each layer has specific responsibility
2. **Error Handling**: Centralized error handling middleware
3. **Validation**: Both schema and business logic validation
4. **Security**: Authentication, authorization, and data protection
5. **Documentation**: Comprehensive API documentation
6. **Code Organization**: Logical folder structure
7. **Environment Config**: Sensitive data in .env files

## Related Documentation

- [Request Flow Details](./REQUEST_FLOW.md)
- [Folder Structure](./FOLDER_STRUCTURE.md)
- [Technologies Used](./TECHNOLOGIES.md)