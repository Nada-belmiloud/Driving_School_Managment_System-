# Lesson Model Documentation

## Overview

The Lesson model represents scheduled driving lessons, connecting students, instructors, and vehicles. It tracks lesson details, status, and outcomes.

## Schema Definition

```javascript
const lessonSchema = new mongoose.Schema({
  studentId: ObjectId,
  instructorId: ObjectId,
  vehicleId: ObjectId,
  date: Date,
  time: String,
  duration: Number,
  status: String,
  lessonType: String,
  location: String,
  notes: String,
  rating: Number,
  cancellationReason: String
}, {
  timestamps: true
});
```

## Fields

### Core References

#### `studentId`
- **Type**: ObjectId
- **Ref**: 'Student'
- **Required**: Yes
- **Description**: Reference to the student taking the lesson
- **Index**: Yes (for fast queries)
- **Example**: `"64abc123def456789"`

#### `instructorId`
- **Type**: ObjectId
- **Ref**: 'Instructor'
- **Required**: Yes
- **Description**: Reference to the instructor teaching the lesson
- **Index**: Yes
- **Example**: `"64def456abc789012"`

#### `vehicleId`
- **Type**: ObjectId
- **Ref**: 'Vehicle'
- **Required**: Yes
- **Description**: Reference to the vehicle used in the lesson
- **Index**: Yes
- **Example**: `"64ghi789jkl012345"`

---

### Scheduling Information

#### `date`
- **Type**: Date
- **Required**: Yes
- **Description**: Date when the lesson is scheduled
- **Index**: Yes (for date-based queries)
- **Example**: `"2024-01-20T00:00:00.000Z"`

#### `time`
- **Type**: String
- **Required**: Yes
- **Format**: "HH:MM" (24-hour format)
- **Description**: Time when the lesson starts
- **Validation**: Must match HH:MM format
- **Example**: `"10:00"`, `"14:30"`

#### `duration`
- **Type**: Number
- **Required**: Yes
- **Default**: 60
- **Min**: 30
- **Max**: 180
- **Description**: Lesson duration in minutes
- **Common Values**:
    - 30 minutes: Short session
    - 60 minutes: Standard lesson (default)
    - 90 minutes: Extended lesson
    - 120 minutes: Double lesson
    - 180 minutes: Half-day intensive
- **Example**: `60`

---

### Status and Type

#### `status`
- **Type**: String
- **Required**: Yes
- **Lowercase**: Yes (automatically converted)
- **Enum**: `['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show']`
- **Default**: `'scheduled'`
- **Description**: Current status of the lesson
- **Status Meanings**:
    - **scheduled**: Lesson is booked for future
    - **in-progress**: Lesson is currently happening
    - **completed**: Lesson finished successfully
    - **cancelled**: Lesson was cancelled
    - **no-show**: Student didn't show up
- **Index**: Yes
- **Example**: `"scheduled"`

#### `lessonType`
- **Type**: String
- **Required**: Yes
- **Lowercase**: Yes (automatically converted)
- **Enum**: `['theory', 'practical', 'test-preparation', 'road-test']`
- **Default**: `'practical'`
- **Description**: Type of lesson
- **Lesson Types**:
    - **theory**: Classroom/theory lesson
    - **practical**: On-road driving practice
    - **test-preparation**: Preparing for driving test
    - **road-test**: Actual driving test
- **Example**: `"practical"`

---

### Location and Details

#### `location`
- **Type**: String
- **Required**: No
- **Trim**: Yes
- **Description**: Where the lesson takes place (pickup location, route, etc.)
- **Example**: `"Student's home -> Downtown -> Highway practice"`

#### `notes`
- **Type**: String
- **Required**: No
- **Description**: Additional notes about the lesson
- **Use Cases**:
    - Instructor feedback
    - Areas covered
    - Student performance notes
    - Special instructions
- **Example**: `"Practiced parallel parking. Student needs more work on lane changes."`

---

### Feedback and Completion

#### `rating`
- **Type**: Number
- **Required**: No
- **Min**: 1
- **Max**: 5
- **Description**: Student's rating of the lesson (1-5 stars)
- **Only For**: Completed lessons
- **Example**: `4`

#### `cancellationReason`
- **Type**: String
- **Required**: No
- **Description**: Reason why lesson was cancelled
- **Only For**: Cancelled lessons
- **Example**: `"Student called in sick"`, `"Vehicle breakdown"`

---

### Timestamps

#### `createdAt`
- **Type**: Date
- **Auto-generated**: Yes
- **Description**: When the lesson was scheduled/created

#### `updatedAt`
- **Type**: Date
- **Auto-generated**: Yes
- **Description**: When the lesson record was last updated

---

## Indexes

### Compound Index: Date + Time
```javascript
lessonSchema.index({ date: 1, time: 1 });
```
**Purpose**: Fast lookup of lessons on specific date and time

### Compound Index: Student + Date
```javascript
lessonSchema.index({ studentId: 1, date: 1 });
```
**Purpose**: Quickly find all lessons for a student

### Compound Index: Instructor + Date
```javascript
lessonSchema.index({ instructorId: 1, date: 1 });
```
**Purpose**: Instructor's schedule

### Compound Index: Vehicle + Date
```javascript
lessonSchema.index({ vehicleId: 1, date: 1 });
```
**Purpose**: Vehicle availability

### Index: Status
```javascript
lessonSchema.index({ status: 1 });
```
**Purpose**: Filter by status

### Index: Lesson Type
```javascript
lessonSchema.index({ lessonType: 1 });
```
**Purpose**: Filter by type

---

## Validation Rules

### Student ID
- **Required**: Yes
- **Error Message**: "Please provide student ID"

### Instructor ID
- **Required**: Yes
- **Error Message**: "Please provide instructor ID"

### Vehicle ID
- **Required**: Yes
- **Error Message**: "Please provide vehicle ID"

### Date
- **Required**: Yes
- **Type**: Date
- **Error Message**: "Please provide lesson date"

### Time
- **Required**: Yes
- **Format**: HH:MM (24-hour)
- **Validation Regex**: `/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/`
- **Error Messages**:
    - Required: "Please provide lesson time"
    - Format: "Time must be in HH:MM format"

### Duration
- **Required**: Yes
- **Min**: 30 minutes
- **Max**: 180 minutes
- **Error Messages**:
    - Required: "Please provide lesson duration"
    - Range: "Duration must be between 30 and 180 minutes"

### Status
- **Enum**: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show']
- **Error Message**: "Invalid lesson status"

### Lesson Type
- **Enum**: ['theory', 'practical', 'test-preparation', 'road-test']
- **Error Message**: "Invalid lesson type"

### Rating
- **Min**: 1
- **Max**: 5
- **Error Message**: "Rating must be between 1 and 5"

---

## Example Usage

### Create Lesson

```javascript
const lesson = await Lesson.create({
  studentId: '64abc123def456789',
  instructorId: '64def456abc789012',
  vehicleId: '64ghi789jkl012345',
  date: '2024-01-20',
  time: '10:00',
  duration: 60,
  lessonType: 'practical',
  location: 'Student home -> City center',
  notes: 'First practical lesson'
});

console.log(lesson.status); // "scheduled" (default)
```

### Find Lessons

```javascript
// Find all lessons for a student
const studentLessons = await Lesson.find({ studentId })
  .populate('instructorId', 'name')
  .populate('vehicleId', 'plateNumber model')
  .sort({ date: -1 });

// Find instructor's schedule
const instructorSchedule = await Lesson.find({
  instructorId,
  date: {
    $gte: new Date('2024-01-01'),
    $lte: new Date('2024-01-31')
  }
})
.populate('studentId', 'name')
.sort({ date: 1, time: 1 });

// Find upcoming lessons
const upcoming = await Lesson.find({
  date: { $gte: new Date() },
  status: 'scheduled'
})
.limit(10)
.sort({ date: 1, time: 1 });
```

### Update Lesson Status

```javascript
// Start lesson
await Lesson.findByIdAndUpdate(lessonId, {
  status: 'in-progress'
});

// Complete lesson
await Lesson.findByIdAndUpdate(lessonId, {
  status: 'completed',
  notes: 'Great progress today!',
  rating: 5
});

// Cancel lesson
await Lesson.findByIdAndUpdate(lessonId, {
  status: 'cancelled',
  cancellationReason: 'Student called in sick'
});
```

### Check Scheduling Conflicts

```javascript
const checkConflict = async (instructorId, vehicleId, date, time) => {
  const conflict = await Lesson.findOne({
    date,
    time,
    status: { $in: ['scheduled', 'in-progress'] },
    $or: [
      { instructorId },
      { vehicleId }
    ]
  });
  
  return !!conflict;
};
```

---

## Common Queries

### Today's Lessons
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const todayLessons = await Lesson.find({
  date: { $gte: today, $lt: tomorrow },
  status: { $in: ['scheduled', 'in-progress'] }
})
.populate('studentId', 'name')
.populate('instructorId', 'name')
.sort({ time: 1 });
```

### Upcoming Lessons (Next 7 Days)
```javascript
const today = new Date();
const nextWeek = new Date();
nextWeek.setDate(today.getDate() + 7);

const upcomingLessons = await Lesson.find({
  date: { $gte: today, $lte: nextWeek },
  status: 'scheduled'
})
.sort({ date: 1, time: 1 });
```

### Completed Lessons with Ratings
```javascript
const ratedLessons = await Lesson.find({
  status: 'completed',
  rating: { $exists: true }
})
.populate('studentId', 'name')
.populate('instructorId', 'name')
.sort({ rating: -1 });
```

### Lessons by Type
```javascript
const practicalCount = await Lesson.countDocuments({ 
  lessonType: 'practical' 
});

const theoryCount = await Lesson.countDocuments({ 
  lessonType: 'theory' 
});
```

---

## Aggregation Examples

### Lesson Statistics

```javascript
const stats = await Lesson.aggregate([
  {
    $facet: {
      total: [
        { $count: 'count' }
      ],
      byStatus: [
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ],
      byType: [
        { $group: { _id: '$lessonType', count: { $sum: 1 } } }
      ],
      avgDuration: [
        { $group: { _id: null, avg: { $avg: '$duration' } } }
      ],
      avgRating: [
        { $match: { rating: { $exists: true } } },
        { $group: { _id: null, avg: { $avg: '$rating' } } }
      ],
      completionRate: [
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            rate: {
              $multiply: [{ $divide: ['$completed', '$total'] }, 100]
            }
          }
        }
      ]
    }
  }
]);
```

### Instructor Performance

```javascript
const instructorPerformance = await Lesson.aggregate([
  {
    $match: {
      status: 'completed',
      rating: { $exists: true }
    }
  },
  {
    $group: {
      _id: '$instructorId',
      totalLessons: { $sum: 1 },
      avgRating: { $avg: '$rating' },
      totalHours: { $sum: { $divide: ['$duration', 60] } }
    }
  },
  {
    $lookup: {
      from: 'instructors',
      localField: '_id',
      foreignField: '_id',
      as: 'instructor'
    }
  },
  { $unwind: '$instructor' },
  {
    $project: {
      instructorName: '$instructor.name',
      totalLessons: 1,
      avgRating: { $round: ['$avgRating', 2] },
      totalHours: { $round: ['$totalHours', 1] }
    }
  },
  { $sort: { avgRating: -1 } }
]);
```

### Monthly Report

```javascript
const monthlyReport = await Lesson.aggregate([
  {
    $group: {
      _id: {
        year: { $year: '$date' },
        month: { $month: '$date' },
        status: '$status'
      },
      count: { $sum: 1 },
      totalRevenue: {
        $sum: {
          $multiply: ['$duration', 1] // Assuming $1 per minute
        }
      }
    }
  },
  {
    $group: {
      _id: {
        year: '$_id.year',
        month: '$_id.month'
      },
      statuses: {
        $push: {
          status: '$_id.status',
          count: '$count'
        }
      },
      totalLessons: { $sum: '$count' },
      totalRevenue: { $sum: '$totalRevenue' }
    }
  },
  { $sort: { '_id.year': -1, '_id.month': -1 } }
]);
```

### Student Progress Report

```javascript
const studentProgress = await Lesson.aggregate([
  {
    $match: {
      studentId: mongoose.Types.ObjectId(studentId)
    }
  },
  {
    $group: {
      _id: '$lessonType',
      count: { $sum: 1 },
      completed: {
        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
      },
      avgRating: { $avg: '$rating' }
    }
  },
  {
    $project: {
      lessonType: '$_id',
      totalLessons: '$count',
      completedLessons: '$completed',
      avgRating: { $round: ['$avgRating', 2] }
    }
  }
]);
```

---

## Relationships

### Populate References

```javascript
// Populate all references
const lesson = await Lesson.findById(lessonId)
  .populate('studentId', 'name email phone')
  .populate('instructorId', 'name specialization')
  .populate('vehicleId', 'plateNumber model transmission');

console.log(lesson.studentId.name);
console.log(lesson.instructorId.name);
console.log(lesson.vehicleId.plateNumber);
```

### Update Related Models

When lesson is completed:
```javascript
const lesson = await Lesson.findById(lessonId)
  .populate('studentId');

if (lesson.status === 'completed') {
  // Update student progress
  const fieldToUpdate = lesson.lessonType === 'theory' 
    ? 'progress.theoryLessons'
    : 'progress.practicalLessons';
    
  await Student.findByIdAndUpdate(lesson.studentId._id, {
    $inc: { [fieldToUpdate]: 1 }
  });
}
```

---

## Business Logic

### Validate Lesson Scheduling

```javascript
const validateLesson = async (lessonData) => {
  // Check student exists and is active
  const student = await Student.findById(lessonData.studentId);
  if (!student) {
    throw new Error('Student not found');
  }
  if (student.status !== 'active') {
    throw new Error('Student is not active');
  }
  
  // Check instructor exists and is active
  const instructor = await Instructor.findById(lessonData.instructorId);
  if (!instructor) {
    throw new Error('Instructor not found');
  }
  if (instructor.status !== 'active') {
    throw new Error('Instructor is not active');
  }
  
  // Check vehicle exists and is available
  const vehicle = await Vehicle.findById(lessonData.vehicleId);
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }
  if (vehicle.status !== 'available') {
    throw new Error('Vehicle is not available');
  }
  
  // Check for scheduling conflicts
  const conflict = await Lesson.findOne({
    date: lessonData.date,
    time: lessonData.time,
    status: { $in: ['scheduled', 'in-progress'] },
    $or: [
      { instructorId: lessonData.instructorId },
      { vehicleId: lessonData.vehicleId }
    ]
  });
  
  if (conflict) {
    throw new Error('Time slot already booked');
  }
  
  return true;
};
```

### Auto-Complete Past Lessons

```javascript
const autoCompletePastLessons = async () => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  // Find lessons that should have finished
  const pastLessons = await Lesson.find({
    date: { $lt: oneHourAgo },
    status: 'in-progress'
  });
  
  // Auto-complete them
  for (const lesson of pastLessons) {
    lesson.status = 'completed';
    lesson.notes = 'Auto-completed (lesson time passed)';
    await lesson.save();
  }
};
```

---

## Best Practices

### 1. Always Populate References

```javascript
// ✅ GOOD
const lessons = await Lesson.find()
  .populate('studentId', 'name')
  .populate('instructorId', 'name')
  .populate('vehicleId', 'plateNumber');

// ❌ BAD - Will only get IDs
const lessons = await Lesson.find();
```

### 2. Check Conflicts Before Scheduling

```javascript
// Always validate before creating
const isValid = await validateLesson(lessonData);
if (!isValid) {
  throw new Error('Cannot schedule lesson');
}

const lesson = await Lesson.create(lessonData);
```

### 3. Update Student Progress

```javascript
// After completing lesson, update student
if (lesson.status === 'completed') {
  const updateField = lesson.lessonType === 'theory'
    ? 'progress.theoryLessons'
    : 'progress.practicalLessons';
    
  await Student.findByIdAndUpdate(lesson.studentId, {
    $inc: { [updateField]: 1 }
  });
}
```

### 4. Use Transactions for Critical Operations

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Create lesson
  const lesson = await Lesson.create([lessonData], { session });
  
  // Update vehicle status
  await Vehicle.findByIdAndUpdate(
    lessonData.vehicleId,
    { status: 'in-use' },
    { session }
  );
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

---

## Related Models

- **Student Model**: Students taking lessons
- **Instructor Model**: Instructors teaching lessons
- **Vehicle Model**: Vehicles used in lessons
- **Payment Model**: Payments for lessons

## Related Endpoints

- [Lessons API](../api/LESSONS.md)
- [Students API](../api/STUDENTS.md)
- [Instructors API](../api/INSTRUCTORS.md)

---

## Database Collection

**Collection Name**: `lessons`

**Example Document**:
```json
{
  "_id": "64jkl012mno345678",
  "studentId": "64abc123def456789",
  "instructorId": "64def456abc789012",
  "vehicleId": "64ghi789jkl012345",
  "date": "2024-01-20T00:00:00.000Z",
  "time": "10:00",
  "duration": 60,
  "status": "completed",
  "lessonType": "practical",
  "location": "Student home -> City center -> Highway",
  "notes": "Great lesson! Student mastered parallel parking.",
  "rating": 5,
  "cancellationReason": null,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-20T11:05:00.000Z"
}
```