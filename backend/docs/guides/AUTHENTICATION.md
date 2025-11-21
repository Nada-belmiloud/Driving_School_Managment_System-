# Authentication Guide

Complete guide to authentication and security in the Driving School Management System.

## Table of Contents
1. [Overview](#overview)
2. [JWT Token System](#jwt-token-system)
3. [Authentication Flow](#authentication-flow)
4. [Token Management](#token-management)
5. [Protected Routes](#protected-routes)
6. [Security Best Practices](#security-best-practices)
7. [Common Scenarios](#common-scenarios)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The system uses **JWT (JSON Web Token)** based authentication with the following features:

- **Token-based authentication** - No sessions on server
- **Password hashing** - Using bcrypt with 10 salt rounds
- **Token expiration** - 7 days by default
- **Role-based access** - Admin and super-admin roles
- **Session tracking** - Active sessions monitoring
- **Account security** - Two-factor authentication support

---

## JWT Token System

### What is JWT?

JWT is a compact, URL-safe token that contains encoded user information. It consists of three parts:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YWJjMTIzIiwiaWF0IjoxNjg5MjQzNjAwLCJleHAiOjE2ODk4NDg0MDB9.signature
│                Header                 │          Payload          │ Signature │
```

### Token Generation

When a user logs in, the server generates a JWT token:

```javascript
// Token generation code
const generateToken = (id) => {
    return jwt.sign(
        { id },                          // Payload: user ID
        process.env.JWT_SECRET,          // Secret key
        { expiresIn: '7d' }             // Expiration time
    );
};
```

**Token Contains**:
- User ID
- Issue timestamp (iat)
- Expiration timestamp (exp)

**Token Does NOT Contain**:
- Password
- Sensitive personal information
- Role (for security reasons)

---

## Authentication Flow

### Registration Flow

```
┌──────────────┐
│ 1. Client    │
│ Sends Data   │
└──────┬───────┘
       │ POST /api/v1/auth/register
       │ { name, email, password }
       ▼
┌──────────────────────┐
│ 2. Server Validates  │
│ - Required fields    │
│ - Email format       │
│ - Unique email       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 3. Hash Password     │
│ bcrypt.hash()        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 4. Create Admin      │
│ Save to database     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 5. Generate Token    │
│ jwt.sign()           │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 6. Return Response   │
│ { success, data,     │
│   token }            │
└──────────────────────┘
```

### Login Flow

```
┌──────────────┐
│ 1. Client    │
│ Sends Login  │
└──────┬───────┘
       │ POST /api/v1/auth/login
       │ { email, password }
       ▼
┌──────────────────────┐
│ 2. Find Admin        │
│ Query database       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 3. Verify Password   │
│ bcrypt.compare()     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 4. Check Status      │
│ isActive === true    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 5. Update Session    │
│ Track login info     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 6. Generate Token    │
│ jwt.sign()           │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 7. Return Response   │
│ { token, user data } │
└──────────────────────┘
```

### Request Authentication Flow

```
┌──────────────┐
│ 1. Client    │
│ Makes Request│
└──────┬───────┘
       │ GET /api/v1/students
       │ Authorization: Bearer <token>
       ▼
┌──────────────────────┐
│ 2. Extract Token     │
│ From header          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 3. Verify Token      │
│ jwt.verify()         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 4. Decode Token      │
│ Get user ID          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 5. Find Admin        │
│ Query database       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 6. Attach to Request │
│ req.admin = admin    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 7. Continue to       │
│ Controller           │
└──────────────────────┘
```

---

## Token Management

### Client-Side Storage

**Recommended Approach** (Using localStorage):

```javascript
// Save token after login
const loginUser = async (email, password) => {
    const response = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
        // Save token
        localStorage.setItem('token', data.data.token);
        
        // Save user info (optional)
        localStorage.setItem('user', JSON.stringify({
            id: data.data.id,
            name: data.data.name,
            email: data.data.email,
            role: data.data.role
        }));
    }
};

// Retrieve token
const getToken = () => {
    return localStorage.getItem('token');
};

// Remove token (logout)
const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};
```

### Including Token in Requests

**Every authenticated request must include the token**:

```javascript
const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });
    
    return response;
};

// Usage
const students = await makeAuthenticatedRequest('http://localhost:5000/api/v1/students');
```

### Token Expiration

Tokens expire after 7 days by default. When a token expires:

1. Server returns `401 Unauthorized`
2. Client should:
    - Remove expired token
    - Redirect to login page
    - Show "Session expired" message

```javascript
const handleApiResponse = async (response) => {
    if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
        return;
    }
    
    return await response.json();
};
```

### Checking Token Expiration

You can decode the token to check expiration without making a server request:

```javascript
const isTokenExpired = () => {
    const token = localStorage.getItem('token');
    
    if (!token) return true;
    
    try {
        // JWT format: header.payload.signature
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000; // Convert to milliseconds
        
        return Date.now() > expiryTime;
    } catch (error) {
        return true; // Invalid token
    }
};

// Check on page load
if (isTokenExpired()) {
    logout();
}
```

---

## Protected Routes

### Server-Side Protection

All routes except login and register require authentication:

```javascript
// Unprotected routes
POST /api/v1/auth/register
POST /api/v1/auth/login

// Protected routes (require token)
GET  /api/v1/auth/me
PUT  /api/v1/auth/updatepassword
POST /api/v1/auth/logout
GET  /api/v1/students
POST /api/v1/students
... (all other endpoints)
```

### Middleware Implementation

The `protect` middleware verifies tokens:

```javascript
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Extract token from Authorization header
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // 2. Check if token exists
    if (!token) {
        return next(new AppError('Not authorized to access this route', 401));
    }

    try {
        // 3. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Find admin and attach to request
        req.admin = await Admin.findById(decoded.id).select('-password');

        if (!req.admin) {
            return next(new AppError('User not found', 401));
        }

        // 5. Continue to controller
        next();
    } catch (error) {
        return next(new AppError('Not authorized to access this route', 401));
    }
});
```

### Client-Side Route Protection

Protect routes in your frontend application:

```javascript
// React example with React Router
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    if (isTokenExpired()) {
        localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

// Usage in routes
<Route 
    path="/dashboard" 
    element={
        <ProtectedRoute>
            <Dashboard />
        </ProtectedRoute>
    } 
/>
```

---

## Security Best Practices

### 1. Password Security

**Minimum Requirements**:
- At least 6 characters (enforced by backend)
- Recommend: 8+ characters with mixed case, numbers, symbols

**Server-Side Hashing**:
```javascript
// Automatic hashing before save
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
```

**Never**:
- Store passwords in plain text
- Log passwords
- Send passwords in responses
- Share passwords via email

### 2. Token Security

**Best Practices**:
- Store in localStorage or sessionStorage
- Include in Authorization header
-  Use HTTPS in production
-  Set appropriate expiration time
-  Clear token on logout

**Avoid**:
- Storing in cookies without httpOnly flag
- Sending token in URL parameters
- Sharing tokens between users
- Using same token for multiple apps

### 3. HTTPS in Production

**Always use HTTPS in production**:
```javascript
// Production configuration
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}
```

### 4. CORS Configuration

```javascript
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 5. Rate Limiting

Implement rate limiting to prevent brute force attacks:

```javascript
// Recommended (not implemented yet in this project)
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many login attempts, please try again later'
});

app.use('/api/v1/auth/login', loginLimiter);
```

### 6. Environment Variables

**Never commit sensitive data**:
```env
# .env file (NEVER commit to git)
JWT_SECRET=your_super_secret_key_here_min_32_chars
JWT_EXPIRE=7d
NODE_ENV=production
```

Add to `.gitignore`:
```
.env
.env.local
.env.production
```

---

## Common Scenarios

### Scenario 1: User Login

```javascript
const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        const response = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error);
        }
        
        // Save token
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
        
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};
```

### Scenario 2: Auto-Login (Remember Me)

```javascript
// Check for existing token on app load
useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token && !isTokenExpired()) {
        // Verify token with server
        verifyToken();
    } else {
        // Redirect to login
        window.location.href = '/login';
    }
}, []);

const verifyToken = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/v1/auth/me', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            setUser(data.data);
        } else {
            // Token invalid
            logout();
        }
    } catch (error) {
        logout();
    }
};
```

### Scenario 3: Password Update

```javascript
const updatePassword = async (currentPassword, newPassword) => {
    try {
        const response = await fetch('http://localhost:5000/api/v1/auth/updatepassword', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error);
        }
        
        // Update token
        localStorage.setItem('token', data.data.token);
        
        alert('Password updated successfully!');
        
    } catch (error) {
        alert(error.message);
    }
};
```

### Scenario 4: Session Timeout Warning

```javascript
let timeoutWarning;
let autoLogout;

const resetSessionTimer = () => {
    clearTimeout(timeoutWarning);
    clearTimeout(autoLogout);
    
    // Warn 5 minutes before expiration
    timeoutWarning = setTimeout(() => {
        alert('Your session will expire in 5 minutes. Please save your work.');
    }, 6.5 * 24 * 60 * 60 * 1000); // 6.5 days
    
    // Auto logout at expiration
    autoLogout = setTimeout(() => {
        logout();
        alert('Your session has expired. Please login again.');
    }, 7 * 24 * 60 * 60 * 1000); // 7 days
};

// Reset timer on user activity
document.addEventListener('click', resetSessionTimer);
document.addEventListener('keypress', resetSessionTimer);

// Initialize on load
resetSessionTimer();
```

### Scenario 5: Multiple Tab Sync

```javascript
// Sync logout across tabs
window.addEventListener('storage', (e) => {
    if (e.key === 'token' && !e.newValue) {
        // Token removed in another tab
        window.location.href = '/login';
    }
});

// Logout function that triggers storage event
const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};
```

---

## Troubleshooting

### Issue 1: "Not authorized to access this route"

**Cause**: Missing or invalid token

**Solutions**:
```javascript
// Check if token exists
const token = localStorage.getItem('token');
console.log('Token:', token);

// Check token format
console.log('Token starts with Bearer?', token?.startsWith('Bearer'));

// Verify token is included in request
console.log('Request headers:', {
    'Authorization': `Bearer ${token}`
});
```

### Issue 2: Token Expired

**Cause**: Token older than 7 days

**Solution**:
```javascript
// Implement auto-refresh (requires backend support)
const refreshToken = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/v1/auth/refresh', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.data.token);
            return true;
        }
    } catch (error) {
        return false;
    }
    
    return false;
};
```

### Issue 3: CORS Error

**Cause**: Frontend and backend on different origins

**Solution**:
```javascript
// Backend: Update CORS configuration
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    credentials: true
}));

// Frontend: Ensure correct API URL
const API_URL = 'http://localhost:5000/api/v1';
```

### Issue 4: Password Comparison Fails

**Cause**: Password not selected from database

**Solution**:
```javascript
// Always select password explicitly for login
const admin = await Admin.findOne({ email }).select('+password');

// Then compare
const isMatch = await admin.comparePassword(password);
```

---

## Related Documentation

- [Authentication API](../api/AUTH.md)
- [Settings API](../api/SETTINGS.md)
- [Admin Model](../models/ADMIN.md)
- [Frontend Guide](./FRONTEND_GUIDE.md)

---

**Security Note**: This system uses industry-standard security practices, but always conduct security audits before deploying to production.