# Request Flow Documentation

## Complete Request Flow: Creating a Student

Here is a complete request from start to finish.

### 1. Frontend Sends Request

```javascript
// Frontend code (React/Vue/etc.)
const response = await fetch('http://localhost:5000/api/v1/students', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    licenseType: 'B',
    dateOfBirth: '2000-01-01'
  })
});
```

### 2. Request Arrives at Server

```
POST /api/v1/students
Headers: { Authorization: "Bearer token...", Content-Type: "application/json" }
Body: { name: "John Doe", email: "john@example.com", ... }
```

### 3. Express Router Matches Route

```javascript
// server.js
app.use('/api/v1/students', studentRoutes);

// student.routes.js
router.post("/", protect, validateStudent, addStudent);
```

Route found! Now run middleware in order:
1. `protect` - Check authentication
2. `validateStudent` - Validate data
3. `addStudent` - Controller function

### 4. Middleware: Authentication (`protect`)

```javascript
// auth.middleware.js - protect function
1. Extract token from Authorization header
   Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

2. Verify token with JWT_SECRET
   jwt.verify(token, process.env.JWT_SECRET)

3. If valid:
   - Decode token → get admin ID
   - Find admin in database
   - Attach to request: req.admin = admin
   - Call next() → continue to next middleware

4. If invalid:
   - Return error 401: "Not authorized"
   - Stop here, don't continue
```

### 5. Middleware: Validation (`validateStudent`)

```javascript
// auth.middleware.js - validateStudent function
1. Check if req.body has name, email, phone, licenseType
2. If missing → return error 400: "Please provide all required fields"
3. If present → call next() → continue to controller
```

### 6. Controller: Create Student (`addStudent`)

```javascript
// student.controller.js - addStudent function
1. Get data from req.body:
   const { name, email, phone, licenseType, dateOfBirth } = req.body;

2. Check if student with this email already exists:
   const existingStudent = await Student.findOne({ email });
   
3. If exists:
   - Return error 400: "Student with this email already exists"
   - Stop here
   
4. If not exists:
   - Create new student in database:
     const student = await Student.create(req.body);
     
5. Database validates data:
   - Email format correct?
   - Phone number valid?
   - Age between 16-100?
   - License type is A, B, C, or D?
   
6. If validation fails:
   - MongoDB throws ValidationError
   - Error handler catches it
   - Returns error 400 with validation messages
   
7. If validation passes:
   - Student saved to database
   - Return success response
```

### 7. Model: Student Schema

```javascript
// student.model.js
1. Mongoose receives data
2. Checks against schema:
   - name: String ✓
   - email: Valid format ✓
   - phone: 10 digits ✓
   - licenseType: One of A/B/C/D ✓
   - dateOfBirth: Age 16-100 ✓
3. Adds default values:
   - registrationDate: Current date
   - status: "active"
   - progress: { theoryLessons: 0, practicalLessons: 0, ... }
4. Saves to MongoDB
5. Returns saved document with _id
```

### 8. Database: MongoDB

```javascript
// MongoDB operation
1. Receives insert command from Mongoose
2. Validates unique constraints (email must be unique)
3. If duplicate email → throws error
4. If unique → inserts document
5. Returns inserted document with _id: "64abc123..."
```

### 9. Response Sent Back

```javascript
// Controller sends response
res.status(201).json({
  success: true,
  data: {
    _id: "64abc123...",
    name: "Mustafa Otsmane",
    email: "mustafa.otsmane@ensia.edu.dz",
    phone: "1234567890",
    licenseType: "B",
    dateOfBirth: "2005-01-01",
    registrationDate: "2024-01-15T10:30:00.000Z",
    status: "active",
    progress: {
      theoryLessons: 0,
      practicalLessons: 0,
      theoryTestPassed: false,
      practicalTestPassed: false
    },
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-01-15T10:30:00.000Z"
  },
  message: "Student created successfully"
});
```

### 10. Frontend Receives Response

```javascript
// Frontend code
const data = await response.json();

if (data.success) {
  console.log('Student created:', data.data);
  // Show success message
  // Update UI
  // Redirect to student list
} else {
  console.error('Error:', data.error);
  // Show error message
}
```

## Complete Flow Diagram

```
Frontend Request
    ↓
Server Receives (Express)
    ↓
Router Matches Route (/api/v1/students POST)
    ↓
Middleware 1: protect (check authentication)
    ↓
Middleware 2: validateStudent (check data)
    ↓
Controller: addStudent
    ↓
Check if student exists (Student.findOne)
    ↓
Create student (Student.create)
    ↓
Model: Validate against schema
    ↓
Database: Save to MongoDB
    ↓
Database: Return saved document
    ↓
Model: Return to controller
    ↓
Controller: Format response
    ↓
Send JSON response to frontend
    ↓
Frontend: Display result
```

## Other Common Request Flows

### GET Request (Retrieve Data)

```
Client Request (GET /api/v1/students)
    ↓
Route: router.get("/", protect, getStudents)
    ↓
Middleware: protect (verify authentication)
    ↓
Controller: getStudents
    ↓
Model: Student.find() with filters
    ↓
Database: Query and return documents
    ↓
Controller: Format with pagination
    ↓
Response: { success: true, data: [...], pagination: {...} }
    ↓
Client: Display list
```

### PUT Request (Update Data)

```
Client Request (PUT /api/v1/students/:id)
    ↓
Route: router.put("/:id", protect, validateStudent, updateStudent)
    ↓
Middleware: protect + validateStudent
    ↓
Controller: updateStudent
    ↓
Model: Student.findByIdAndUpdate()
    ↓
Database: Update document
    ↓
Response: { success: true, data: updatedStudent }
```

### DELETE Request

```
Client Request (DELETE /api/v1/students/:id)
    ↓
Route: router.delete("/:id", protect, deleteStudent)
    ↓
Middleware: protect
    ↓
Controller: deleteStudent
    ↓
Model: Student.findByIdAndDelete()
    ↓
Database: Remove document
    ↓
Response: { success: true, message: "Student deleted" }
```

## Error Flow

### Validation Error

```
Client sends invalid data
    ↓
Middleware: validateStudent
    ↓
Missing required field detected
    ↓
Return 400 error immediately
    ↓
Client: Display error message
(Controller never reached)
```

### Authentication Error

```
Client sends request without token
    ↓
Middleware: protect
    ↓
No token found
    ↓
Return 401 Unauthorized
    ↓
Client: Redirect to login
(Controller never reached)
```

### Database Error

```
Controller: Create student
    ↓
Model: Validate data
    ↓
Database: Duplicate email found
    ↓
MongoDB throws error
    ↓
Error middleware catches it
    ↓
Format error response
    ↓
Return 400: "Email already exists"
    ↓
Client: Display error
```

## Performance Considerations

### Query Optimization
- Use indexes for frequently queried fields
- Limit returned fields with `.select()`
- Implement pagination to avoid large datasets

### Caching Strategy
- Cache frequently accessed data
- Invalidate cache on updates
- Use Redis for distributed caching (future)

### Connection Pooling
- MongoDB driver handles connection pooling
- Reuses connections instead of creating new ones
- Configure pool size based on load

## Security in Request Flow

### Input Validation
1. **Middleware validation**: Basic checks (required fields)
2. **Schema validation**: Data type and format checks
3. **Business logic validation**: Domain-specific rules

### Authentication Flow
1. Extract token from header
2. Verify token signature
3. Check token expiration
4. Load user from database
5. Attach user to request
6. Continue to controller

### Authorization Flow
1. Check if user is authenticated
2. Verify user role
3. Check resource permissions
4. Allow or deny access

## Related Documentation

- [Architecture Overview](./OVERVIEW.md)
- [Middleware Documentation](../guides/MIDDLEWARE.md)
- [Error Handling](../guides/ERROR_HANDLING.md)