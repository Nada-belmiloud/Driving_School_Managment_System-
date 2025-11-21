# Troubleshooting Guide

Common issues and solutions for the Driving School Management System.

## Table of Contents
1. [Connection Issues](#connection-issues)
2. [Authentication Errors](#authentication-errors)
3. [Database Errors](#database-errors)
4. [Validation Errors](#validation-errors)
5. [API Errors](#api-errors)
6. [Performance Issues](#performance-issues)
7. [Development Environment](#development-environment)
8. [Debugging Tips](#debugging-tips)

---

## Connection Issues

### Issue 1: Cannot Connect to Server

**Symptoms**:
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
```

**Causes**:
1. Server is not running
2. Wrong port number
3. Firewall blocking connection

**Solutions**:

#### Check if Server is Running
```bash
# Look for the server startup message
npm run dev

# You should see:
# ✅ MongoDB Connected: 127.0.0.1
# Server running on port: 5000
```

#### Verify Port Number
```javascript
// Check your API URL
const API_URL = 'http://localhost:5000/api/v1'; // Default port

// Try accessing health endpoint
fetch('http://localhost:5000/health')
    .then(r => r.json())
    .then(data => console.log(data))
    .catch(err => console.error('Server not accessible:', err));
```

#### Check Firewall
```bash
# Windows: Allow Node.js through firewall
# Mac/Linux: Check if port is available
lsof -i :5000
```

---

### Issue 2: CORS Error

**Symptoms**:
```
Access to fetch at 'http://localhost:5000/api/v1/students' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Cause**: Frontend and backend on different origins, CORS not configured

**Solution**:

#### Update Backend CORS Configuration
```javascript
// backend/src/server.js
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### Or Allow All Origins (Development Only)
```javascript
app.use(cors({
    origin: '*' // Allow all origins - development only!
}));
```

#### Update .env File
```env
CORS_ORIGIN=http://localhost:3000
```

---

### Issue 3: MongoDB Connection Failed

**Symptoms**:
```
❌ Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Causes**:
1. MongoDB not running
2. Wrong connection string
3. MongoDB not installed

**Solutions**:

#### Start MongoDB
```bash
# Mac (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

#### Verify MongoDB is Running
```bash
# Connect to MongoDB shell
mongosh

# Or check with:
ps aux | grep mongod  # Mac/Linux
```

#### Check Connection String
```javascript
// backend/src/config/db.js
const MONGO_URI = "mongodb://127.0.0.1:27017/driving_school";

// If using MongoDB Atlas:
// const MONGO_URI = "mongodb+srv://username:password@cluster.mongodb.net/driving_school";
```

#### Install MongoDB
```bash
# Mac
brew tap mongodb/brew
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Windows: Download from mongodb.com
```

---

## Authentication Errors

### Issue 1: "Not authorized to access this route"

**Symptoms**:
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

**Causes**:
1. Missing token
2. Invalid token
3. Expired token
4. Token not in correct format

**Solutions**:

#### Check Token Exists
```javascript
const token = localStorage.getItem('token');
console.log('Token:', token);

if (!token) {
    console.error('No token found! Please login.');
}
```

#### Verify Token Format
```javascript
// Token should NOT include "Bearer" when stored
// ✓ Correct: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
// ✗ Wrong: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// When sending request, add "Bearer " prefix:
headers: {
    'Authorization': `Bearer ${token}` // Note the space after "Bearer"
}
```

#### Check Token Expiration
```javascript
const isTokenExpired = () => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() > payload.exp * 1000;
    } catch {
        return true;
    }
};

if (isTokenExpired()) {
    console.error('Token expired! Please login again.');
    localStorage.removeItem('token');
    window.location.href = '/login';
}
```

#### Test Token with cURL
```bash
# Replace YOUR_TOKEN with actual token
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/v1/auth/me
```

---

### Issue 2: "Invalid credentials"

**Symptoms**:
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Causes**:
1. Wrong email
2. Wrong password
3. User doesn't exist
4. Account deactivated

**Solutions**:

#### Verify Login Credentials
```javascript
// Check exact email format
console.log('Email:', email.trim().toLowerCase());

// Passwords are case-sensitive
console.log('Password length:', password.length);
```

#### Check if Account Exists
```bash
# Connect to MongoDB
mongosh driving_school

# Check if admin exists
db.admins.findOne({ email: "your.email@example.com" })
```

#### Create Admin if Needed
```bash
# Using Postman or cURL
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Name",
    "email": "admin@example.com",
    "password": "password123"
  }'
```

#### Check Account Status
```javascript
// Account might be deactivated
// Check isActive field in database
db.admins.findOne({ email: "your.email@example.com" }, { isActive: 1 })

// Reactivate if needed
db.admins.updateOne(
    { email: "your.email@example.com" },
    { $set: { isActive: true } }
)
```

---

### Issue 3: Password Won't Update

**Symptoms**:
```json
{
  "success": false,
  "error": "Current password is incorrect"
}
```

**Solutions**:

#### Ensure Current Password is Correct
```javascript
const updatePassword = async (currentPassword, newPassword) => {
    // Double-check current password
    console.log('Current password:', currentPassword);
    
    const response = await fetch('http://localhost:5000/api/v1/auth/updatepassword', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
    });
    
    const data = await response.json();
    
    if (!data.success) {
        console.error('Update failed:', data.error);
    }
};
```

#### Reset Password Directly (Development Only)
```bash
# Connect to MongoDB
mongosh driving_school

# Hash new password using bcrypt
# Then update directly:
db.admins.updateOne(
    { email: "your.email@example.com" },
    { $set: { password: "HASHED_PASSWORD_HERE" } }
)
```

---

## Database Errors

### Issue 1: Duplicate Key Error

**Symptoms**:
```json
{
  "success": false,
  "error": "email already exists"
}
```

**Causes**:
1. Email already registered
2. Unique constraint violation

**Solutions**:

#### Check Existing Record
```bash
mongosh driving_school

# Find existing student
db.students.findOne({ email: "student@example.com" })

# Or check all duplicates
db.students.find({ email: "student@example.com" }).count()
```

#### Use Update Instead of Create
```javascript
// Instead of creating, update existing
const studentExists = await Student.findOne({ email });

if (studentExists) {
    // Update existing student
    const updated = await Student.findByIdAndUpdate(
        studentExists._id,
        { ...newData },
        { new: true }
    );
} else {
    // Create new student
    const created = await Student.create(newData);
}
```

#### Remove Duplicate Records
```bash
# Find duplicates
db.students.aggregate([
    { $group: { _id: "$email", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
])

# Remove duplicates (keep the first one)
db.students.remove({ 
    email: "duplicate@example.com",
    _id: { $ne: "ID_TO_KEEP" }
})
```

---

### Issue 2: Validation Error

**Symptoms**:
```json
{
  "success": false,
  "error": "Validation failed: email: Please provide a valid email"
}
```

**Causes**:
1. Required field missing
2. Invalid format
3. Value out of range

**Solutions**:

#### Check Required Fields
```javascript
// Student model requires:
const requiredFields = {
    name: 'string (2-100 chars)',
    email: 'valid email',
    phone: '10-15 digits',
    licenseType: 'A, B, C, or D'
};

// Validate before sending
const validateStudent = (data) => {
    const errors = [];
    
    if (!data.name || data.name.length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    
    if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
        errors.push('Valid email required');
    }
    
    if (!data.phone || !/^\d{10,15}$/.test(data.phone)) {
        errors.push('Phone must be 10-15 digits');
    }
    
    if (!['A', 'B', 'C', 'D'].includes(data.licenseType)) {
        errors.push('License type must be A, B, C, or D');
    }
    
    return errors;
};

const errors = validateStudent(studentData);
if (errors.length > 0) {
    console.error('Validation errors:', errors);
}
```

#### Phone Number Format
```javascript
// Remove non-digits
const cleanPhone = phone.replace(/\D/g, '');

// Validate length
if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    throw new Error('Phone must be 10-15 digits');
}

// Use cleaned phone
studentData.phone = cleanPhone;
```

#### Email Format
```javascript
// Trim and lowercase
const cleanEmail = email.trim().toLowerCase();

// Validate format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(cleanEmail)) {
    throw new Error('Invalid email format');
}
```

---

### Issue 3: CastError

**Symptoms**:
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**Causes**:
1. Invalid MongoDB ObjectId format
2. Wrong ID used

**Solutions**:

#### Validate ObjectId Format
```javascript
import mongoose from 'mongoose';

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Check before making request
if (!isValidObjectId(studentId)) {
    console.error('Invalid student ID format');
    return;
}
```

#### Get Correct ID
```javascript
// IDs should look like: "64abc123def456789"
// NOT: "123" or "student-1"

// Get ID from response
const student = await Student.create(data);
const correctId = student._id; // or student._id.toString()

console.log('Student ID:', correctId);
```

---

## Validation Errors

### Issue 1: Date Validation Failed

**Symptoms**:
```
Student must be between 16 and 100 years old
```

**Solutions**:

#### Check Date Format
```javascript
// Correct format: YYYY-MM-DD
const dateOfBirth = '2005-01-15'; // ✓ Correct
const wrong = '15/01/2005';       // ✗ Wrong

// Convert if needed
const convertDate = (date) => {
    // If in DD/MM/YYYY format
    const parts = date.split('/');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
};
```

#### Calculate Age
```javascript
const calculateAge = (dateOfBirth) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
};

const age = calculateAge('2005-01-15');
console.log('Age:', age); // Should be between 16-100
```

---

### Issue 2: Time Format Error

**Symptoms**:
```
Time must be in HH:MM format
```

**Solutions**:

#### Use Correct Format
```javascript
// Correct: 24-hour format
const validTimes = ['09:00', '14:30', '23:59']; // ✓

// Wrong formats
const invalidTimes = ['9:00', '2:30 PM', '9', '1400']; // ✗

// Convert to correct format
const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

console.log(formatTime('9:00')); // "09:00"
```

---

## API Errors

### Issue 1: 404 Not Found

**Symptoms**:
```json
{
  "success": false,
  "error": "Route /api/v1/student not found"
}
```

**Causes**:
1. Wrong endpoint URL
2. Typo in route
3. Missing API version

**Solutions**:

#### Check Endpoint URL
```javascript
// ✓ Correct endpoints
const endpoints = {
    students: 'http://localhost:5000/api/v1/students',      // Note: plural
    lessons: 'http://localhost:5000/api/v1/lessons',
    payments: 'http://localhost:5000/api/v1/payments'
};

// ✗ Common mistakes
const wrong = {
    student: 'http://localhost:5000/api/v1/student',        // Missing 's'
    noVersion: 'http://localhost:5000/api/students',        // Missing '/v1'
    wrongPort: 'http://localhost:3000/api/v1/students'      // Wrong port
};
```

#### List All Available Routes
```bash
# Start server and check startup message
npm run dev

# Available endpoints are listed:
# • Students:    /api/v1/students
# • Instructors: /api/v1/instructors
# • Vehicles:    /api/v1/vehicles
# • Lessons:     /api/v1/lessons
# • Payments:    /api/v1/payments
```

---

### Issue 2: 500 Internal Server Error

**Symptoms**:
```json
{
  "success": false,
  "error": "Server Error"
}
```

**Causes**:
1. Unhandled exception in code
2. Database connection lost
3. Missing environment variable

**Solutions**:

#### Check Server Logs
```bash
# Look at server console output
npm run dev

# Look for error stack traces
# Example error:
# Error: Cannot read property 'name' of undefined
#     at studentController.js:45:23
```

#### Check Environment Variables
```javascript
// Verify required env vars
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');
```

#### Enable Debug Mode
```bash
# Run with debug logging
NODE_ENV=development npm run dev
```

---

### Issue 3: Request Timeout

**Symptoms**:
```
Request timeout
net::ERR_CONNECTION_TIMED_OUT
```

**Causes**:
1. Large dataset
2. Slow database query
3. Network issues
4. Missing indexes

**Solutions**:

#### Use Pagination
```javascript
// Instead of fetching all records
const students = await fetch('http://localhost:5000/api/v1/students');

// Use pagination
const students = await fetch('http://localhost:5000/api/v1/students?page=1&limit=10');
```

#### Add Database Indexes
```bash
mongosh driving_school

# Check existing indexes
db.students.getIndexes()

# Add index for common queries
db.students.createIndex({ email: 1 })
db.lessons.createIndex({ date: 1, time: 1 })
```

---

## Performance Issues

### Issue 1: Slow API Responses

**Symptoms**: API takes more than 2-3 seconds to respond

**Solutions**:

#### Use Pagination Always
```javascript
// Default to reasonable limits
const fetchStudents = async (page = 1, limit = 10) => {
    return await fetch(
        `http://localhost:5000/api/v1/students?page=${page}&limit=${limit}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
    );
};
```

#### Limit Populated Fields
```javascript
// Backend: Select only needed fields
const students = await Student.find()
    .select('name email phone status')  // Only select needed fields
    .limit(10);
```

#### Cache Frequently Accessed Data
```javascript
// Simple cache implementation
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = async (key, fetchFn) => {
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    
    const data = await fetchFn();
    cache.set(key, { data, timestamp: Date.now() });
    
    return data;
};

// Usage
const students = await getCachedData(
    'students-page-1',
    () => fetch('http://localhost:5000/api/v1/students?page=1').then(r => r.json())
);
```

---

### Issue 2: Memory Leaks

**Symptoms**: Application slows down over time

**Solutions**:

#### Clear Unused Event Listeners
```javascript
// React: Use cleanup in useEffect
useEffect(() => {
    const handleClick = () => console.log('clicked');
    document.addEventListener('click', handleClick);
    
    // Cleanup
    return () => {
        document.removeEventListener('click', handleClick);
    };
}, []);
```

#### Clear Intervals/Timeouts
```javascript
// Store interval ID
const intervalId = setInterval(() => {
    checkForUpdates();
}, 5000);

// Clear when component unmounts
return () => clearInterval(intervalId);
```

---

## Development Environment

### Issue 1: npm install Fails

**Solutions**:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still failing, try:
npm install --legacy-peer-deps
```

---

### Issue 2: Port Already in Use

**Symptoms**:
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions**:

#### Kill Process Using Port
```bash
# Mac/Linux
lsof -ti :5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

---

### Issue 3: Nodemon Not Working

**Solutions**:

```bash
# Install globally
npm install -g nodemon

# Or use local installation
npx nodemon src/server.js

# Check nodemon.json configuration
{
  "watch": ["src"],
  "ext": "js,json",
  "ignore": ["node_modules"],
  "exec": "node src/server.js"
}
```

---

## Debugging Tips

### Enable Detailed Logging

```javascript
// Add request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});
```

### Use Browser DevTools

```javascript
// Check network tab for:
// - Request URL
// - Request headers
// - Request payload
// - Response status
// - Response body

// Use console to debug
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

### MongoDB Debugging

```bash
# Enable MongoDB logging
mongod --logpath /var/log/mongodb/mongod.log --logappend

# Watch logs
tail -f /var/log/mongodb/mongod.log

# Check database
mongosh driving_school
db.currentOp() # See current operations
db.getCollectionNames() # List collections
```

---

## Getting Additional Help

If issues persist:

1. **Check GitHub Issues**: Look for similar problems
2. **Server Logs**: Always check server console output
3. **Database Logs**: Check MongoDB logs
4. **Network Tab**: Use browser DevTools Network tab
5. **API Testing**: Test with Postman or cURL
6. **Clean Start**: Stop server, clear database, restart

### Useful Commands

```bash
# Restart everything
pkill -f node          # Kill all node processes
brew services restart mongodb-community  # Restart MongoDB
npm run dev            # Start server fresh

# Check everything is running
ps aux | grep node     # Check Node
ps aux | grep mongod   # Check MongoDB
```

---

## Related Documentation

- [Frontend Guide](./FRONTEND_GUIDE.md)
- [Authentication Guide](./AUTHENTICATION.md)
- [API Documentation](../api/)
- [Architecture Overview](../architecture/OVERVIEW.md)

---

**Remember**: Most issues can be resolved by:
1. Checking server is running
2. Verifying MongoDB is running
3. Ensuring token is valid
4. Using correct API endpoints
5. Validating data before sending