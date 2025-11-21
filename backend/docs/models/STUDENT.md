# Student Model Documentation

## Overview

The Student model represents individuals enrolled in the driving school to learn how to drive and obtain their driver's license.

## Schema Definition

```javascript
const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  licenseType: String,
  dateOfBirth: Date,
  registrationDate: Date,
  status: String,
  progress: {
    theoryLessons: Number,
    practicalLessons: Number,
    theoryTestPassed: Boolean,
    practicalTestPassed: Boolean
  },
  notes: String
}, {
  timestamps: true
});
```

## Fields

### Personal Information

#### `name`
- **Type**: String
- **Required**: Yes
- **Trim**: Yes
- **Description**: Student's full name
- **Validation**:
    - Minimum 2 characters
    - Maximum 100 characters
- **Example**: `"John Doe"`

#### `email`
- **Type**: String
- **Required**: Yes
- **Unique**: Yes
- **Lowercase**: Yes (automatically converted)
- **Trim**: Yes
- **Description**: Student's email address
- **Validation**: Must be valid email format
- **Example**: `"john.doe@example.com"`

#### `phone`
- **Type**: String
- **Required**: Yes
- **Trim**: Yes
- **Description**: Student's contact phone number
- **Validation**: Must be 10-15 digits
- **Example**: `"1234567890"`

#### `address`
- **Type**: String
- **Required**: No
- **Trim**: Yes
- **Description**: Student's home address
- **Example**: `"123 Main Street, New York, NY 10001"`

#### `dateOfBirth`
- **Type**: Date
- **Required**: No
- **Description**: Student's date of birth
- **Validation**: Age must be between 16 and 100 years
- **Example**: `"2000-01-15T00:00:00.000Z"`

---

### Enrollment Information

#### `licenseType`
- **Type**: String
- **Required**: Yes
- **Uppercase**: Yes (automatically converted)
- **Enum**: `['A', 'B', 'C', 'D']`
- **Description**: Type of driver's license student is pursuing
- **License Types**:
    - **A**: Motorcycles
    - **B**: Cars (most common)
    - **C**: Trucks/Large vehicles
    - **D**: Buses/Commercial vehicles
- **Example**: `"B"`

#### `registrationDate`
- **Type**: Date
- **Default**: Current date/time
- **Description**: When the student registered
- **Auto-generated**: Yes
- **Example**: `"2024-01-15T10:30:00.000Z"`

#### `status`
- **Type**: String
- **Required**: Yes
- **Lowercase**: Yes (automatically converted)
- **Enum**: `['active', 'completed', 'suspended', 'dropped']`
- **Default**: `'active'`
- **Description**: Current enrollment status
- **Status Meanings**:
    - **active**: Currently taking lessons
    - **completed**: Passed all tests, obtained license
    - **suspended**: Temporarily paused (payment issues, etc.)
    - **dropped**: Student withdrew from program
- **Example**: `"active"`

---

### Progress Tracking

#### `progress`
An embedded object tracking the student's learning progress.

```javascript
{
  theoryLessons: Number,
  practicalLessons: Number,
  theoryTestPassed: Boolean,
  practicalTestPassed: Boolean
}
```

##### `progress.theoryLessons`
- **Type**: Number
- **Default**: 0
- **Min**: 0
- **Description**: Number of theory/classroom lessons completed
- **Example**: `5`

##### `progress.practicalLessons`
- **Type**: Number
- **Default**: 0
- **Min**: 0
- **Description**: Number of practical driving lessons completed
- **Example**: `12`

##### `progress.theoryTestPassed`
- **Type**: Boolean
- **Default**: false
- **Description**: Whether student passed the written theory test
- **Example**: `true`

##### `progress.practicalTestPassed`
- **Type**: Boolean
- **Default**: false
- **Description**: Whether student passed the practical driving test
- **Example**: `false`

---

### Additional Information

#### `notes`
- **Type**: String
- **Required**: No
- **Description**: Additional notes about the student
- **Use Cases**:
    - Special requirements
    - Learning challenges
    - Schedule preferences
    - Instructor feedback
- **Example**: `"Student learns quickly, prefers morning lessons"`

---

### Timestamps

#### `createdAt`
- **Type**: Date
- **Auto-generated**: Yes
- **Description**: When the student record was created

#### `updatedAt`
- **Type**: Date
- **Auto-generated**: Yes
- **Description**: When the student record was last updated

---

## Virtual Fields

Virtual fields are computed properties that don't exist in the database.

### `age`
Calculates student's current age from date of birth.

```javascript
studentSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});
```

**Usage**:
```javascript
const student = await Student.findById(id);
console.log(student.age); // 24
```

### `totalLessons`
Total number of lessons (theory + practical).

```javascript
studentSchema.virtual('totalLessons').get(function() {
  return this.progress.theoryLessons + this.progress.practicalLessons;
});
```

---

## Indexes

### Compound Index for Search
```javascript
studentSchema.index({ name: 'text', email: 'text', phone: 'text' });
```

**Purpose**: Fast text search across name, email, and phone

### Index on Email
```javascript
studentSchema.index({ email: 1 }, { unique: true });
```

**Purpose**: Fast email lookups and ensure uniqueness

### Index on Status
```javascript
studentSchema.index({ status: 1 });
```

**Purpose**: Fast filtering by status

### Index on Registration Date
```javascript
studentSchema.index({ registrationDate: -1 });
```

**Purpose**: Sort students by registration date (newest first)

---

## Validation Rules

### Name
- **Required**: Yes
- **Min Length**: 2 characters
- **Max Length**: 100 characters
- **Error Messages**:
    - Required: "Please provide student name"
    - Length: "Name must be between 2 and 100 characters"

### Email
- **Required**: Yes
- **Format**: Valid email with @ symbol
- **Unique**: Yes
- **Error Messages**:
    - Required: "Please provide an email"
    - Format: "Please provide a valid email"
    - Unique: "A student with this email already exists"

### Phone
- **Required**: Yes
- **Format**: 10-15 digits only
- **Validation Regex**: `/^\d{10,15}$/`
- **Error Messages**:
    - Required: "Please provide a phone number"
    - Format: "Phone must be 10-15 digits"

### License Type
- **Required**: Yes
- **Enum**: ['A', 'B', 'C', 'D']
- **Error Messages**:
    - Required: "Please provide a license type"
    - Enum: "License type must be A, B, C, or D"

### Date of Birth
- **Age Range**: 16-100 years
- **Custom Validator**:
```javascript
validate: {
  validator: function(v) {
    if (!v) return true; // Optional field
    
    const age = calculateAge(v);
    return age >= 16 && age <= 100;
  },
  message: 'Student must be between 16 and 100 years old'
}
```

### Status
- **Enum**: ['active', 'completed', 'suspended', 'dropped']
- **Error Message**: "Invalid status value"

### Progress Values
- **Theory Lessons**: Min 0
- **Practical Lessons**: Min 0
- **Error Message**: "Lesson count cannot be negative"

---

## Example Usage

### Create Student

```javascript
const student = await Student.create({
  name: 'Yacine Kerai',
  email: 'Yacine@example.com',
  phone: '1234567890',
  address: '123 Main St',
  licenseType: 'B',
  dateOfBirth: '2000-01-15',
  notes: 'Prefers morning lessons'
});

console.log(student._id); // MongoDB generated ID
console.log(student.status); // "active" (default)
console.log(student.progress.theoryLessons); // 0 (default)
```

### Find Students

```javascript
// Find all active students
const activeStudents = await Student.find({ status: 'active' });

// Find students by license type
const licenseBStudents = await Student.find({ licenseType: 'B' });

// Text search
const results = await Student.find({
  $text: { $search: 'Yacine' }
});

// Find recent registrations (last 30 days)
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const recentStudents = await Student.find({
  registrationDate: { $gte: thirtyDaysAgo }
});
```

### Update Progress

```javascript
const student = await Student.findById(studentId);

// Increment lesson counts
student.progress.practicalLessons += 1;
await student.save();

// Mark test as passed
await Student.findByIdAndUpdate(studentId, {
  'progress.theoryTestPassed': true
});

// Update multiple fields
await Student.findByIdAndUpdate(studentId, {
  $inc: { 'progress.practicalLessons': 1 },
  $set: { 'progress.practicalTestPassed': true }
});
```

### Update Status

```javascript
// Complete the course
await Student.findByIdAndUpdate(studentId, {
  status: 'completed'
});

// Suspend student
await Student.findByIdAndUpdate(studentId, {
  status: 'suspended',
  notes: 'Suspended due to payment issues'
});
```

---

## Common Queries

### Get Students by Status
```javascript
const completed = await Student.countDocuments({ status: 'completed' });
const active = await Student.countDocuments({ status: 'active' });
```

### Get Students by License Type
```javascript
const counts = await Student.aggregate([
  {
    $group: {
      _id: '$licenseType',
      count: { $sum: 1 }
    }
  }
]);
// Result: [{ _id: 'A', count: 10 }, { _id: 'B', count: 50 }, ...]
```

### Find Students Ready for Test
```javascript
// Students who completed required lessons but haven't passed tests
const readyForTheoryTest = await Student.find({
  'progress.theoryLessons': { $gte: 10 },
  'progress.theoryTestPassed': false,
  status: 'active'
});

const readyForPracticalTest = await Student.find({
  'progress.practicalLessons': { $gte: 20 },
  'progress.theoryTestPassed': true,
  'progress.practicalTestPassed': false,
  status: 'active'
});
```

### Get Top Students
```javascript
// Students with most lessons completed
const topStudents = await Student.find()
  .sort({ 
    'progress.practicalLessons': -1,
    'progress.theoryLessons': -1
  })
  .limit(10);
```

### Search Students
```javascript
// Search by name, email, or phone
const searchResults = await Student.find({
  $or: [
    { name: new RegExp(searchTerm, 'i') },
    { email: new RegExp(searchTerm, 'i') },
    { phone: new RegExp(searchTerm, 'i') }
  ]
});
```

---

## Aggregation Examples

### Statistics Dashboard

```javascript
const stats = await Student.aggregate([
  {
    $facet: {
      // Total by status
      byStatus: [
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ],
      // Total by license type
      byLicenseType: [
        { $group: { _id: '$licenseType', count: { $sum: 1 } } }
      ],
      // Average progress
      averageProgress: [
        {
          $group: {
            _id: null,
            avgTheory: { $avg: '$progress.theoryLessons' },
            avgPractical: { $avg: '$progress.practicalLessons' }
          }
        }
      ],
      // Recent registrations
      recentCount: [
        {
          $match: {
            registrationDate: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        },
        { $count: 'count' }
      ]
    }
  }
]);
```

### Monthly Registration Report

```javascript
const monthlyReport = await Student.aggregate([
  {
    $group: {
      _id: {
        year: { $year: '$registrationDate' },
        month: { $month: '$registrationDate' }
      },
      count: { $sum: 1 },
      students: { $push: '$name' }
    }
  },
  { $sort: { '_id.year': -1, '_id.month': -1 } }
]);
```

---

## Relationships

### With Lesson Model
Students are referenced in lessons:

```javascript
const lessons = await Lesson.find({ studentId: student._id });
```

### With Payment Model
Students are referenced in payments:

```javascript
const payments = await Payment.find({ studentId: student._id });
```

---

## Business Logic

### Check if Student Can Schedule Lesson

```javascript
const canScheduleLesson = (student) => {
  if (student.status !== 'active') {
    return { allowed: false, reason: 'Student is not active' };
  }
  
  // Check if student has outstanding payments
  const hasPendingPayments = await Payment.findOne({
    studentId: student._id,
    status: 'pending'
  });
  
  if (hasPendingPayments) {
    return { allowed: false, reason: 'Pending payments must be cleared' };
  }
  
  return { allowed: true };
};
```

### Check Course Completion

```javascript
const isCourseComplete = (student) => {
  const minTheoryLessons = 10;
  const minPracticalLessons = 20;
  
  return (
    student.progress.theoryLessons >= minTheoryLessons &&
    student.progress.practicalLessons >= minPracticalLessons &&
    student.progress.theoryTestPassed &&
    student.progress.practicalTestPassed
  );
};
```

---

## Best Practices

### 1. Always Validate Email Uniqueness

```javascript
// Before creating
const existingStudent = await Student.findOne({ email });
if (existingStudent) {
  throw new Error('Email already exists');
}

// Or let MongoDB handle it and catch the error
try {
  await Student.create(studentData);
} catch (error) {
  if (error.code === 11000) {
    throw new Error('Email already exists');
  }
}
```

### 2. Use Atomic Updates for Progress

```javascript
// GOOD - Atomic increment
await Student.findByIdAndUpdate(studentId, {
  $inc: { 'progress.practicalLessons': 1 }
});

// BAD - Race condition possible
const student = await Student.findById(studentId);
student.progress.practicalLessons += 1;
await student.save();
```

### 3. Include Pagination

```javascript
const page = 1;
const limit = 10;
const skip = (page - 1) * limit;

const students = await Student.find()
  .skip(skip)
  .limit(limit)
  .sort({ registrationDate: -1 });

const total = await Student.countDocuments();
```

### 4. Clean Data Before Saving

```javascript
// Trim whitespace, convert to proper case
studentData.name = studentData.name.trim();
studentData.email = studentData.email.toLowerCase().trim();
studentData.licenseType = studentData.licenseType.toUpperCase();
```

---

## Related Models

- **Lesson Model**: Tracks lessons scheduled for students
- **Payment Model**: Tracks payments made by students
- **Instructor Model**: Instructors who teach students

## Related Endpoints

- [Students API](../api/STUDENTS.md)
- [Lessons API](../api/LESSONS.md)
- [Payments API](../api/PAYMENTS.md)

---

## Database Collection

**Collection Name**: `students`

**Example Document**:
```json
{
  "_id": "64abc123def456789",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "address": "123 Main St, New York, NY",
  "licenseType": "B",
  "dateOfBirth": "2000-01-15T00:00:00.000Z",
  "registrationDate": "2024-01-15T10:30:00.000Z",
  "status": "active",
  "progress": {
    "theoryLessons": 8,
    "practicalLessons": 15,
    "theoryTestPassed": true,
    "practicalTestPassed": false
  },
  "notes": "Good student, learns quickly",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-02-20T14:15:00.000Z"
}
```