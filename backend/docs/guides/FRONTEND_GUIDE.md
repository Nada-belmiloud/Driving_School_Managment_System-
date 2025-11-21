# Frontend Developer Guide

This guide helps frontend developers integrate with the Driving School Management System backend API.

## Table of Contents
1. [Authentication](#authentication)
2. [Making API Calls](#making-api-calls)
3. [API Helper Class](#api-helper-class)
4. [Error Handling](#error-handling)
5. [React Examples](#react-examples)
6. [Best Practices](#best-practices)

---

## Authentication

### Login Flow

**Step 1: Send login request**
```javascript
const response = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password123'
  })
});

const data = await response.json();
```

**Step 2: Receive and save token**
```javascript
if (data.success) {
  // Save token to localStorage
  localStorage.setItem('token', data.data.token);
  localStorage.setItem('user', JSON.stringify(data.data));
  
  // Redirect to dashboard
  window.location.href = '/dashboard';
}
```

**Step 3: Use token in subsequent requests**
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:5000/api/v1/students', {
  headers: {
    'Authorization': `Bearer ${token}`  // ← Include token here
  }
});
```

### Logout
```javascript
// Remove token from storage
localStorage.removeItem('token');
localStorage.removeItem('user');

// Optional: Call logout endpoint
await fetch('http://localhost:5000/api/v1/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Redirect to login
window.location.href = '/login';
```

### Check if User is Logged In
```javascript
const isLoggedIn = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Usage
if (!isLoggedIn()) {
  window.location.href = '/login';
}
```

---

## Making API Calls

### GET Request - Retrieve Data
```javascript
const getStudents = async (page = 1, limit = 10) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:5000/api/v1/students?page=${page}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return await response.json();
};

// Usage
const result = await getStudents(1, 10);
console.log(result.data); // Array of students
console.log(result.pagination); // Pagination info
```

### POST Request - Create Data
```javascript
const createStudent = async (studentData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/v1/students', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(studentData)
  });
  
  return await response.json();
};

// Usage
const newStudent = await createStudent({
  name: 'Abderrahmane Horri',
  email: 'abderrahmane.houri@ensia.edu.dz',
  phone: '1234567890',
  licenseType: 'B'
});
```

### PUT Request - Update Data
```javascript
const updateStudent = async (studentId, updates) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:5000/api/v1/students/${studentId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    }
  );
  
  return await response.json();
};

// Usage
const updated = await updateStudent('64abc123...', {
  phone: '9876543210',
  status: 'active'
});
```

### DELETE Request - Delete Data
```javascript
const deleteStudent = async (studentId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:5000/api/v1/students/${studentId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return await response.json();
};

// Usage
await deleteStudent('64abc123...');
```

---

## API Helper Class

Create a reusable API client class:

```javascript
// api.js
class DrivingSchoolAPI {
  constructor(baseURL = 'http://localhost:5000/api/v1') {
    this.baseURL = baseURL;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data));

    return data;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Students
  async getStudents(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters
    });
    return await this.request(`/students?${params}`);
  }

  async getStudent(id) {
    return await this.request(`/students/${id}`);
  }

  async createStudent(studentData) {
    return await this.request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  }

  async updateStudent(id, updates) {
    return await this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteStudent(id) {
    return await this.request(`/students/${id}`, {
      method: 'DELETE'
    });
  }

  // Lessons
  async getLessons(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/lessons?${params}`);
  }

  async scheduleLesson(lessonData) {
    return await this.request('/lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData)
    });
  }

  async checkAvailability(instructorId, vehicleId, date, time) {
    return await this.request('/lessons/check-availability', {
      method: 'POST',
      body: JSON.stringify({ instructorId, vehicleId, date, time })
    });
  }

  // Add more methods as needed...
}

// Export singleton instance
export const api = new DrivingSchoolAPI();
```

### Usage

```javascript
import { api } from './api';

// Login
await api.login('admin@example.com', 'password123');

// Get students
const students = await api.getStudents(1, 10, { search: 'john' });

// Create student
const newStudent = await api.createStudent({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
  licenseType: 'B'
});
```

---

## Error Handling

### API Response Format

**Success Response:**
```javascript
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
```javascript
{
  "success": false,
  "error": "Error message here"
}
```

### Handling Errors

```javascript
const apiCall = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/v1/students', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return data.data;

  } catch (error) {
    console.error('Error:', error.message);
    alert(error.message);
    
    // Handle specific errors
    if (error.message.includes('401')) {
      // Token expired - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
};
```

### Common Error Codes

| Code | Meaning | Action                                         |
|------|---------|------------------------------------------------|
| 400 | Bad Request | Show validation error to user                  |
| 401 | Unauthorized | Redirect to login                              |
| 403 | Forbidden | Show permission error                          |
| 404 | Not Found | Show "not found" message                       |
| 500 | Server Error | Show generic error, try again (very rare to heppen) |

---

## React Examples

### Login Component

```jsx
import React, { useState } from 'react';
import { api } from './api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.login(email, password);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      
      {error && <div className="error">{error}</div>}
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

export default Login;
```

### Student List Component

```jsx
import React, { useState, useEffect } from 'react';
import { api } from './api';

function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadStudents();
  }, [page]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const result = await api.getStudents(page, 10);
      setStudents(result.data);
      setPagination(result.pagination);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      await api.deleteStudent(id);
      loadStudents(); // Reload list
      alert('Student deleted successfully');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Students</h1>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>License Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student._id}>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.phone}</td>
              <td>{student.licenseType}</td>
              <td>
                <button onClick={() => handleDelete(student._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div>
        <button 
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>

        <span>
          Page {pagination.page} of {pagination.pages}
        </span>

        <button 
          disabled={page === pagination.pages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default StudentList;
```

### Create Student Form

```jsx
import React, { useState } from 'react';
import { api } from './api';

function CreateStudent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    licenseType: 'B',
    dateOfBirth: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    setErrors({
      ...errors,
      [e.target.name]: ''
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone || !/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10-15 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      await api.createStudent(formData);
      alert('Student created successfully!');
      // Reset form or redirect
      setFormData({
        name: '',
        email: '',
        phone: '',
        licenseType: 'B',
        dateOfBirth: '',
        address: ''
      });
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Student</h2>

      <div>
        <label>Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div>
        <label>Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div>
        <label>Phone *</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        {errors.phone && <span className="error">{errors.phone}</span>}
      </div>

      <div>
        <label>License Type *</label>
        <select
          name="licenseType"
          value={formData.licenseType}
          onChange={handleChange}
          required
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
      </div>

      <div>
        <label>Date of Birth</label>
        <input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Student'}
      </button>
    </form>
  );
}

export default CreateStudent;
```

---

## Best Practices

### 1. Token Management

```javascript
// Check token expiration
const isTokenExpired = () => {
  const token = localStorage.getItem('token');
  if (!token) return true;
  
  // JWT tokens have 3 parts separated by dots
  const payload = JSON.parse(atob(token.split('.')[1]));
  const expiry = payload.exp * 1000; // Convert to milliseconds
  
  return Date.now() > expiry;
};

// Auto-refresh before expiration
setInterval(() => {
  if (isTokenExpired()) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}, 60000); // Check every minute
```

### 2. Loading States

Always show loading indicators:
```javascript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await api.someAction();
  } finally {
    setLoading(false); // Always reset loading
  }
};
```

### 3. Error Boundaries

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

### 4. Debounce Search

```javascript
let searchTimeout;

const handleSearchChange = (value) => {
  clearTimeout(searchTimeout);
  
  searchTimeout = setTimeout(() => {
    searchStudents(value);
  }, 500); // Wait 500ms after user stops typing
};
```

### 5. Data Caching

```javascript
const cache = new Map();

const getCachedData = async (key, fetchFn, ttl = 5 * 60 * 1000) => {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const data = await fetchFn();
  cache.set(key, { data, timestamp: Date.now() });
  
  return data;
};

// Usage
const instructors = await getCachedData(
  'instructors',
  () => api.getInstructors()
);
```

---

## Related Documentation

- [Authentication API](../api/AUTH.md)
- [Students API](../api/STUDENTS.md)
- [Common Use Cases](./USE_CASES.md)
- [Troubleshooting](./TROUBLESHOOTING.md)