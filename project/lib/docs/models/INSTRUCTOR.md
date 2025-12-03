# Instructor Model Documentation

## Overview

The Instructor model represents driving instructors who teach students and conduct lessons at the driving school.

## Schema Definition

```javascript
const instructorSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  licenseNumber: String,
  experienceYears: Number,
  specialization: String,
  dateOfBirth: Date,
  hireDate: Date,
  status: String,
  availability: {
    monday: Boolean,
    tuesday: Boolean,
    wednesday: Boolean,
    thursday: Boolean,
    friday: Boolean,
    saturday: Boolean,
    sunday: Boolean
  },
  emergencyContact: String,
  emergencyPhone: String,
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
- **Description**: Instructor's full name
- **Validation**:
    - Minimum 2 characters
    - Maximum 100 characters
- **Example**: `"Brairi Houssam"`

#### `email`
- **Type**: String
- **Required**: Yes
- **Unique**: Yes
- **Lowercase**: Yes (automatically converted)
- **Trim**: Yes
- **Description**: Instructor's email address
- **Validation**: Must be valid email format
- **Example**: `"Brairi.Houssam@drivingschool.com"`

#### `phone`
- **Type**: String
- **Required**: Yes
- **Trim**: Yes
- **Description**: Instructor's contact phone number
- **Validation**: Must be 10-15 digits
- **Example**: `"9876543210"`

#### `dateOfBirth`
- **Type**: Date
- **Required**: No
- **Description**: Instructor's date of birth
- **Validation**: Age must be between 21 and 75 years
- **Example**: `"1985-05-20T00:00:00.000Z"`

---

### Professional Information

#### `licenseNumber`
- **Type**: String
- **Required**: Yes
- **Unique**: Yes
- **Trim**: Yes
- **Uppercase**: Yes (automatically converted)
- **Description**: Instructor's professional driving instructor license number
- **Validation**: Must be unique
- **Example**: `"INS-12345-NY"`

#### `experienceYears`
- **Type**: Number
- **Required**: Yes
- **Min**: 0
- **Max**: 60
- **Description**: Years of experience as a driving instructor
- **Example**: `8`

#### `specialization`
- **Type**: String
- **Required**: Yes
- **Lowercase**: Yes (automatically converted)
- **Enum**: `['manual', 'automatic', 'both']`
- **Default**: `'both'`
- **Description**: Type of transmission the instructor can teach
- **Specializations**:
    - **manual**: Only manual transmission vehicles
    - **automatic**: Only automatic transmission vehicles
    - **both**: Can teach both manual and automatic
- **Example**: `"both"`

---

### Employment Information

#### `hireDate`
- **Type**: Date
- **Default**: Current date/time
- **Description**: When the instructor was hired
- **Auto-generated**: Yes
- **Example**: `"2020-03-15T00:00:00.000Z"`

#### `status`
- **Type**: String
- **Required**: Yes
- **Lowercase**: Yes (automatically converted)
- **Enum**: `['active', 'inactive', 'on-leave', 'terminated']`
- **Default**: `'active'`
- **Description**: Current employment status
- **Status Meanings**:
    - **active**: Currently working and can be scheduled
    - **inactive**: Not currently working (but still employed)
    - **on-leave**: Temporarily absent (vacation, sick leave)
    - **terminated**: No longer employed
- **Example**: `"active"`

---

### Availability

#### `availability`
Weekly schedule showing which days the instructor is available to work.

```javascript
{
  monday: Boolean,
  tuesday: Boolean,
  wednesday: Boolean,
  thursday: Boolean,
  friday: Boolean,
  saturday: Boolean,
  sunday: Boolean
}
```

**Defaults**: All days set to `true`

**Example**:
```javascript
{
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false
}
```

**Usage**: Check before scheduling lessons

---

### Emergency Contact

#### `emergencyContact`
- **Type**: String
- **Required**: No
- **Trim**: Yes
- **Description**: Name of emergency contact person
- **Example**: `"Mahmoudi (friend)"`

#### `emergencyPhone`
- **Type**: String
- **Required**: No
- **Trim**: Yes
- **Description**: Emergency contact phone number
- **Validation**: 10 digits if provided
- **Example**: `"9876543210"`

---

### Additional Information

#### `notes`
- **Type**: String
- **Required**: No
- **Description**: Additional notes about the instructor
- **Use Cases**:
    - Special skills or certifications
    - Performance notes
    - Preferences or restrictions
- **Example**: `"Specializes in nervous students, excellent with teenagers"`

---

### Timestamps

#### `createdAt`
- **Type**: Date
- **Auto-generated**: Yes
- **Description**: When the instructor record was created

#### `updatedAt`
- **Type**: Date
- **Auto-generated**: Yes
- **Description**: When the instructor record was last updated

---

## Virtual Fields

### `age`
Calculates instructor's current age from date of birth.

```javascript
instructorSchema.virtual('age').get(function() {
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

### `yearsWithCompany`
Calculates how many years the instructor has worked at the school.

```javascript
instructorSchema.virtual('yearsWithCompany').get(function() {
  if (!this.hireDate) return 0;
  
  const today = new Date();
  const hire = new Date(this.hireDate);
  const years = today.getFullYear() - hire.getFullYear();
  
  return years;
});
```

### `availableDays`
Returns array of days instructor is available.

```javascript
instructorSchema.virtual('availableDays').get(function() {
  const days = [];
  if (this.availability.monday) days.push('Monday');
  if (this.availability.tuesday) days.push('Tuesday');
  if (this.availability.wednesday) days.push('Wednesday');
  if (this.availability.thursday) days.push('Thursday');
  if (this.availability.friday) days.push('Friday');
  if (this.availability.saturday) days.push('Saturday');
  if (this.availability.sunday) days.push('Sunday');
  return days;
});
```

---

## Indexes

### Unique Index on Email
```javascript
instructorSchema.index({ email: 1 }, { unique: true });
```

### Unique Index on License Number
```javascript
instructorSchema.index({ licenseNumber: 1 }, { unique: true });
```

### Index on Status
```javascript
instructorSchema.index({ status: 1 });
```

### Compound Index for Search
```javascript
instructorSchema.index({ name: 'text', email: 'text', phone: 'text' });
```

---

## Validation Rules

### Name
- **Required**: Yes
- **Min Length**: 2 characters
- **Max Length**: 100 characters
- **Error Messages**:
    - Required: "Please provide instructor name"
    - Length: "Name must be between 2 and 100 characters"

### Email
- **Required**: Yes
- **Format**: Valid email
- **Unique**: Yes
- **Error Messages**:
    - Required: "Please provide an email"
    - Format: "Please provide a valid email"
    - Unique: "An instructor with this email already exists"

### Phone
- **Required**: Yes
- **Format**: 10 digits
- **Validation Regex**: `/^\d{10}$/`
- **Error Messages**:
    - Required: "Please provide a phone number"
    - Format: "Phone must be 10-15 digits"

### License Number
- **Required**: Yes
- **Unique**: Yes
- **Error Messages**:
    - Required: "Please provide a license number"
    - Unique: "This license number is already registered"

### Experience Years
- **Required**: Yes
- **Min**: 0
- **Max**: 60
- **Error Messages**:
    - Required: "Please provide experience years"
    - Range: "Experience must be between 0 and 60 years"

### Specialization
- **Required**: Yes
- **Enum**: ['manual', 'automatic', 'both']
- **Error Message**: "Specialization must be manual, automatic, or both"

### Date of Birth
- **Age Range**: 21-75 years
- **Custom Validator**:
```javascript
validate: {
  validator: function(v) {
    if (!v) return true; // Optional field
    
    const age = calculateAge(v);
    return age >= 21 && age <= 75;
  },
  message: 'Instructor must be between 21 and 75 years old'
}
```

### Status
- **Enum**: ['active', 'inactive', 'on-leave', 'terminated']
- **Error Message**: "Invalid status value"

### Emergency Phone
- **Format**: 10-15 digits (if provided)
- **Validation**: Only validated if field is not empty

---

## Example Usage

### Create Instructor

```javascript
const instructor = await Instructor.create({
  name: 'Brairi Hossam',
  email: 'Brairi@drivingschool.com',
  phone: '9876543210',
  licenseNumber: 'INS-12345-NY',
  experienceYears: 8,
  specialization: 'both',
  dateOfBirth: '1985-05-20',
  availability: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  },
  emergencyContact: 'Mahmoudi (Friend)',
  emergencyPhone: '9876543211',
  notes: 'Excellent with nervous students'
});

console.log(instructor._id); // MongoDB generated ID
console.log(instructor.status); // "active" (default)
```

### Find Instructors

```javascript
// Find all active instructors
const activeInstructors = await Instructor.find({ status: 'active' });

// Find instructors by specialization
const manualInstructors = await Instructor.find({ 
  specialization: { $in: ['manual', 'both'] }
});

// Find available on specific day
const mondayInstructors = await Instructor.find({
  'availability.monday': true,
  status: 'active'
});

// Find by experience level
const experiencedInstructors = await Instructor.find({
  experienceYears: { $gte: 5 }
});
```

### Update Availability

```javascript
// Change weekly schedule
await Instructor.findByIdAndUpdate(instructorId, {
  'availability.saturday': true,
  'availability.sunday': false
});

// Update multiple days
await Instructor.findByIdAndUpdate(instructorId, {
  availability: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: false
  }
});
```

### Update Status

```javascript
// Put instructor on leave
await Instructor.findByIdAndUpdate(instructorId, {
  status: 'on-leave',
  notes: 'On vacation until March 1st'
});

// Reactivate instructor
await Instructor.findByIdAndUpdate(instructorId, {
  status: 'active',
  notes: 'Back from leave'
});
```

---

## Common Queries

### Get Instructors by Status
```javascript
const statusCounts = await Instructor.aggregate([
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 }
    }
  }
]);
```

### Find Available Instructors for Date
```javascript
const findAvailableInstructors = async (dayOfWeek) => {
  // dayOfWeek: 'monday', 'tuesday', etc.
  const dayField = `availability.${dayOfWeek}`;
  
  return await Instructor.find({
    [dayField]: true,
    status: 'active'
  });
};

// Usage
const mondayInstructors = await findAvailableInstructors('monday');
```

### Get Instructors Compatible with Vehicle
```javascript
// Find instructors who can teach with automatic vehicles
const vehicle = await Vehicle.findById(vehicleId);

const compatibleInstructors = await Instructor.find({
  specialization: { 
    $in: [vehicle.transmission, 'both'] 
  },
  status: 'active'
});
```

### Most Experienced Instructors
```javascript
const topInstructors = await Instructor.find({ status: 'active' })
  .sort({ experienceYears: -1 })
  .limit(10);
```

### Search Instructors
```javascript
const searchResults = await Instructor.find({
  $or: [
    { name: new RegExp(searchTerm, 'i') },
    { email: new RegExp(searchTerm, 'i') },
    { phone: new RegExp(searchTerm, 'i') }
  ]
});
```

---

## Aggregation Examples

### Instructor Statistics

```javascript
const stats = await Instructor.aggregate([
  {
    $facet: {
      // Count by status
      byStatus: [
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ],
      // Count by specialization
      bySpecialization: [
        { $group: { _id: '$specialization', count: { $sum: 1 } } }
      ],
      // Average experience
      avgExperience: [
        {
          $group: {
            _id: null,
            avgYears: { $avg: '$experienceYears' },
            maxYears: { $max: '$experienceYears' },
            minYears: { $min: '$experienceYears' }
          }
        }
      ],
      // Availability by day
      availabilityByDay: [
        {
          $project: {
            monday: '$availability.monday',
            tuesday: '$availability.tuesday',
            wednesday: '$availability.wednesday',
            thursday: '$availability.thursday',
            friday: '$availability.friday',
            saturday: '$availability.saturday',
            sunday: '$availability.sunday'
          }
        },
        {
          $group: {
            _id: null,
            mondayCount: { $sum: { $cond: ['$monday', 1, 0] } },
            tuesdayCount: { $sum: { $cond: ['$tuesday', 1, 0] } },
            wednesdayCount: { $sum: { $cond: ['$wednesday', 1, 0] } },
            thursdayCount: { $sum: { $cond: ['$thursday', 1, 0] } },
            fridayCount: { $sum: { $cond: ['$friday', 1, 0] } },
            saturdayCount: { $sum: { $cond: ['$saturday', 1, 0] } },
            sundayCount: { $sum: { $cond: ['$sunday', 1, 0] } }
          }
        }
      ]
    }
  }
]);
```

### Lessons Taught by Instructor

```javascript
const instructorPerformance = await Lesson.aggregate([
  {
    $match: {
      instructorId: mongoose.Types.ObjectId(instructorId),
      status: 'completed'
    }
  },
  {
    $group: {
      _id: '$instructorId',
      totalLessons: { $sum: 1 },
      avgRating: { $avg: '$rating' },
      lessonTypes: { 
        $push: '$lessonType' 
      }
    }
  },
  {
    $lookup: {
      from: 'instructors',
      localField: '_id',
      foreignField: '_id',
      as: 'instructor'
    }
  }
]);
```

---

## Relationships

### With Lesson Model
Instructors are referenced in lessons:

```javascript
const lessons = await Lesson.find({ instructorId: instructor._id });
```

### Check Schedule Conflicts

```javascript
const hasConflict = async (instructorId, date, time) => {
  const existingLesson = await Lesson.findOne({
    instructorId,
    date,
    time,
    status: { $in: ['scheduled', 'in-progress'] }
  });
  
  return !!existingLesson;
};
```

---

## Business Logic

### Check Instructor Availability for Lesson

```javascript
const canScheduleLesson = async (instructor, date, time, vehicleTransmission) => {
  // Check employment status
  if (instructor.status !== 'active') {
    return { 
      available: false, 
      reason: 'Instructor is not currently active' 
    };
  }
  
  // Check day availability
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
  if (!instructor.availability[dayOfWeek]) {
    return { 
      available: false, 
      reason: `Instructor not available on ${dayOfWeek}s` 
    };
  }
  
  // Check specialization compatibility
  if (instructor.specialization !== 'both' && 
      instructor.specialization !== vehicleTransmission) {
    return { 
      available: false, 
      reason: 'Instructor specialization does not match vehicle transmission' 
    };
  }
  
  // Check for scheduling conflicts
  const hasConflict = await Lesson.findOne({
    instructorId: instructor._id,
    date,
    time,
    status: { $in: ['scheduled', 'in-progress'] }
  });
  
  if (hasConflict) {
    return { 
      available: false, 
      reason: 'Instructor already has a lesson at this time' 
    };
  }
  
  return { available: true };
};
```

### Calculate Instructor Workload

```javascript
const getInstructorWorkload = async (instructorId, startDate, endDate) => {
  const lessons = await Lesson.find({
    instructorId,
    date: { $gte: startDate, $lte: endDate },
    status: { $in: ['scheduled', 'completed'] }
  });
  
  const totalHours = lessons.reduce((sum, lesson) => {
    return sum + (lesson.duration / 60); // Convert minutes to hours
  }, 0);
  
  return {
    totalLessons: lessons.length,
    totalHours,
    averagePerDay: totalHours / getDaysBetween(startDate, endDate)
  };
};
```

---

## Best Practices

### 1. Check Uniqueness

```javascript
// Check email uniqueness
const existingEmail = await Instructor.findOne({ email });
if (existingEmail) {
  throw new Error('Email already exists');
}

// Check license number uniqueness
const existingLicense = await Instructor.findOne({ licenseNumber });
if (existingLicense) {
  throw new Error('License number already registered');
}
```

### 2. Validate Before Scheduling

```javascript
// Always check availability before creating lesson
const availability = await canScheduleLesson(instructor, date, time, transmission);
if (!availability.available) {
  throw new Error(availability.reason);
}
```

### 3. Update Status Carefully

```javascript
// When terminating, keep historical data
await Instructor.findByIdAndUpdate(instructorId, {
  status: 'terminated',
  notes: `Terminated on ${new Date().toISOString()}. Reason: ${reason}`
});

// Don't delete instructor records - they're referenced in historical lessons
```

### 4. Use Aggregation for Reports

```javascript
// Get instructor performance metrics
const performance = await Lesson.aggregate([
  { $match: { instructorId: mongoose.Types.ObjectId(instructorId) } },
  {
    $group: {
      _id: '$instructorId',
      totalLessons: { $sum: 1 },
      completedLessons: {
        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
      },
      avgRating: { $avg: '$rating' }
    }
  }
]);
```

---

## Related Models

- **Lesson Model**: Tracks lessons taught by instructors
- **Vehicle Model**: Vehicles driven by instructors
- **Student Model**: Students taught by instructors

## Related Endpoints

- [Instructors API](../api/INSTRUCTORS.md)
- [Lessons API](../api/LESSONS.md)

---

## Database Collection

**Collection Name**: `instructors`

**Example Document**:
```json
{
  "_id": "64def456abc789012",
  "name": "Michael Smith",
  "email": "michael@drivingschool.com",
  "phone": "9876543210",
  "licenseNumber": "INS-12345-NY",
  "experienceYears": 8,
  "specialization": "both",
  "dateOfBirth": "1985-05-20T00:00:00.000Z",
  "hireDate": "2020-03-15T00:00:00.000Z",
  "status": "active",
  "availability": {
    "monday": true,
    "tuesday": true,
    "wednesday": true,
    "thursday": true,
    "friday": true,
    "saturday": false,
    "sunday": false
  },
  "emergencyContact": "Jane Smith (Wife)",
  "emergencyPhone": "9876543211",
  "notes": "Excellent with nervous students",
  "createdAt": "2020-03-15T00:00:00.000Z",
  "updatedAt": "2024-01-20T10:30:00.000Z"
}
```