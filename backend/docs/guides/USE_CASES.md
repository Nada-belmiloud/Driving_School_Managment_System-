# Common Use Cases

Real-world examples and workflows for the Driving School Management System.

## Table of Contents
1. [Student Registration Flow](#student-registration-flow)
2. [Lesson Scheduling Flow](#lesson-scheduling-flow)
3. [Payment Processing Flow](#payment-processing-flow)
4. [Vehicle Maintenance Flow](#vehicle-maintenance-flow)
5. [Student Progress Tracking](#student-progress-tracking)
6. [Report Generation](#report-generation)
7. [Complete Workflows](#complete-workflows)

---

## Student Registration Flow

### Use Case: Register a New Student

**Scenario**: A new student walks into the driving school and wants to enroll.

**Steps**:

#### 1. Check if Student Already Exists

```javascript
// Search for existing student
const checkExisting = async (email) => {
    const response = await fetch(
        `http://localhost:5000/api/v1/students?search=${email}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );
    
    const data = await response.json();
    
    if (data.count > 0) {
        alert('Student already registered!');
        return data.data[0];
    }
    
    return null;
};
```

#### 2. Collect Student Information

```javascript
const studentData = {
    name: 'Malak Miliani',
    email: 'malak.miliani@example.com',
    phone: '0555123456',
    address: '123 Rue de la Liberté, Algiers',
    licenseType: 'B',
    dateOfBirth: '2005-03-15',
    notes: 'Prefers morning lessons'
};
```

#### 3. Register Student

```javascript
const registerStudent = async (studentData) => {
    try {
        const response = await fetch('http://localhost:5000/api/v1/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(studentData)
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error);
        }
        
        console.log('Student registered:', data.data);
        alert(`Student ${data.data.name} registered successfully!`);
        
        return data.data;
        
    } catch (error) {
        alert('Registration failed: ' + error.message);
        throw error;
    }
};

// Execute
const newStudent = await registerStudent(studentData);
```

#### 4. Create Initial Payment Record

```javascript
const createInitialPayment = async (studentId) => {
    const payment = {
        studentId: studentId,
        amount: 30000, // Registration fee in DZD
        method: 'cash',
        status: 'paid',
        category: 'registration',
        description: 'Initial registration fee',
        date: new Date().toISOString()
    };
    
    const response = await fetch('http://localhost:5000/api/v1/payments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payment)
    });
    
    const data = await response.json();
    console.log('Payment recorded:', data.data);
    
    return data.data;
};

await createInitialPayment(newStudent._id);
```

#### 5. Complete Workflow

```javascript
const completeStudentRegistration = async (studentInfo) => {
    try {
        // 1. Check existing
        const existing = await checkExisting(studentInfo.email);
        if (existing) return existing;
        
        // 2. Register student
        const student = await registerStudent(studentInfo);
        
        // 3. Record payment
        const payment = await createInitialPayment(student._id);
        
        // 4. Return success
        return {
            success: true,
            student,
            payment,
            message: 'Student registered successfully!'
        };
        
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
};

// Usage
const result = await completeStudentRegistration({
    name: 'Malak Miliani',
    email: 'malak.miliani@example.com',
    phone: '0555123456',
    licenseType: 'B',
    dateOfBirth: '2005-03-15'
});
```

---

## Lesson Scheduling Flow

### Use Case: Schedule a Driving Lesson

**Scenario**: Student wants to book a practical driving lesson for next week.

**Steps**:

#### 1. Get Available Instructors

```javascript
const getAvailableInstructors = async (date, transmission = 'automatic') => {
    // Get day of week
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { 
        weekday: 'lowercase' 
    });
    
    // Find active instructors available on this day
    const response = await fetch(
        `http://localhost:5000/api/v1/instructors?status=active`,
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    
    const data = await response.json();
    
    // Filter by availability and specialization
    const available = data.data.filter(instructor => {
        const dayAvailable = instructor.availability[dayOfWeek];
        const canTeach = instructor.specialization === 'both' || 
                        instructor.specialization === transmission;
        
        return dayAvailable && canTeach;
    });
    
    return available;
};

const instructors = await getAvailableInstructors('2024-01-25', 'automatic');
console.log('Available instructors:', instructors);
```

#### 2. Get Available Vehicles

```javascript
const getAvailableVehicles = async (transmission = 'automatic') => {
    const response = await fetch(
        `http://localhost:5000/api/v1/vehicles?status=available&transmission=${transmission}`,
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    
    const data = await response.json();
    return data.data;
};

const vehicles = await getAvailableVehicles('automatic');
console.log('Available vehicles:', vehicles);
```

#### 3. Check Time Slot Availability

```javascript
const checkTimeSlotAvailability = async (instructorId, vehicleId, date, time) => {
    const response = await fetch(
        'http://localhost:5000/api/v1/lessons/check-availability',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                instructorId,
                vehicleId,
                date,
                time
            })
        }
    );
    
    const data = await response.json();
    return data.data;
};

const availability = await checkTimeSlotAvailability(
    instructors[0]._id,
    vehicles[0]._id,
    '2024-01-25',
    '10:00'
);

if (availability.available) {
    console.log('Time slot is available!');
} else {
    console.log('Conflicts:', availability.conflicts);
}
```

#### 4. Schedule the Lesson

```javascript
const scheduleLesson = async (lessonData) => {
    try {
        const response = await fetch('http://localhost:5000/api/v1/lessons', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(lessonData)
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error);
        }
        
        console.log('Lesson scheduled:', data.data);
        return data.data;
        
    } catch (error) {
        console.error('Scheduling failed:', error);
        throw error;
    }
};

const lesson = await scheduleLesson({
    studentId: '64abc123def456789',
    instructorId: instructors[0]._id,
    vehicleId: vehicles[0]._id,
    date: '2024-01-25',
    time: '10:00',
    duration: 60,
    lessonType: 'practical',
    location: 'Student home -> City center',
    notes: 'First practical lesson - focus on basics'
});
```

#### 5. Complete Scheduling Workflow

```javascript
const completeBookingFlow = async (studentId, preferences) => {
    try {
        const { date, time, duration, transmission, location } = preferences;
        
        // 1. Get available instructors
        const instructors = await getAvailableInstructors(date, transmission);
        if (instructors.length === 0) {
            throw new Error('No instructors available for this date');
        }
        
        // 2. Get available vehicles
        const vehicles = await getAvailableVehicles(transmission);
        if (vehicles.length === 0) {
            throw new Error('No vehicles available');
        }
        
        // 3. Try to find available slot
        let availableSlot = null;
        
        for (const instructor of instructors) {
            for (const vehicle of vehicles) {
                const availability = await checkTimeSlotAvailability(
                    instructor._id,
                    vehicle._id,
                    date,
                    time
                );
                
                if (availability.available) {
                    availableSlot = { instructor, vehicle };
                    break;
                }
            }
            if (availableSlot) break;
        }
        
        if (!availableSlot) {
            throw new Error('No available time slots found');
        }
        
        // 4. Schedule lesson
        const lesson = await scheduleLesson({
            studentId,
            instructorId: availableSlot.instructor._id,
            vehicleId: availableSlot.vehicle._id,
            date,
            time,
            duration,
            lessonType: 'practical',
            location
        });
        
        return {
            success: true,
            lesson,
            instructor: availableSlot.instructor,
            vehicle: availableSlot.vehicle
        };
        
    } catch (error) {
        console.error('Booking failed:', error);
        throw error;
    }
};

// Usage
const booking = await completeBookingFlow('64abc123def456789', {
    date: '2024-01-25',
    time: '10:00',
    duration: 60,
    transmission: 'automatic',
    location: 'Student home -> Highway practice'
});
```

---

## Payment Processing Flow

### Use Case: Record a Student Payment

**Scenario**: Student pays for a package of 5 lessons.

#### 1. Calculate Package Price

```javascript
const calculatePackagePrice = (numberOfLessons, pricePerLesson = 2500) => {
    const subtotal = numberOfLessons * pricePerLesson;
    
    // Apply discounts
    let discount = 0;
    if (numberOfLessons >= 10) {
        discount = 0.15; // 15% discount for 10+ lessons
    } else if (numberOfLessons >= 5) {
        discount = 0.10; // 10% discount for 5-9 lessons
    }
    
    const total = subtotal * (1 - discount);
    
    return {
        numberOfLessons,
        pricePerLesson,
        subtotal,
        discount: subtotal * discount,
        total
    };
};

const package = calculatePackagePrice(5);
console.log(package);
// { numberOfLessons: 5, pricePerLesson: 2500, subtotal: 12500, discount: 1250, total: 11250 }
```

#### 2. Record Payment

```javascript
const recordPayment = async (paymentData) => {
    try {
        const response = await fetch('http://localhost:5000/api/v1/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(paymentData)
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error);
        }
        
        return data.data;
        
    } catch (error) {
        console.error('Payment recording failed:', error);
        throw error;
    }
};

const payment = await recordPayment({
    studentId: '64abc123def456789',
    amount: 11250,
    method: 'card',
    status: 'paid',
    category: 'lesson',
    description: 'Package of 5 practical lessons (10% discount applied)',
    transactionId: 'TXN-' + Date.now()
});
```

#### 3. Generate Receipt

```javascript
const generateReceipt = (payment, student) => {
    return {
        receiptNumber: payment.receiptNumber,
        date: new Date(payment.paidDate || payment.date).toLocaleDateString(),
        student: {
            name: student.name,
            email: student.email
        },
        items: [
            {
                description: payment.description,
                quantity: 1,
                unitPrice: payment.amount,
                total: payment.amount
            }
        ],
        subtotal: payment.amount,
        tax: 0, // No tax in this example
        total: payment.amount,
        method: payment.method,
        status: payment.status
    };
};

// Get student info
const studentResponse = await fetch(
    `http://localhost:5000/api/v1/students/${payment.studentId}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
);
const studentData = await studentResponse.json();

const receipt = generateReceipt(payment, studentData.data);
console.log('Receipt:', receipt);
```

#### 4. Send Receipt Email (Mock)

```javascript
const sendReceiptEmail = async (email, receipt) => {
    // This would integrate with an email service
    console.log(`Sending receipt to ${email}`);
    console.log('Receipt details:', receipt);
    
    // Mock email sending
    return {
        success: true,
        message: 'Receipt sent successfully'
    };
};

await sendReceiptEmail(studentData.data.email, receipt);
```

---

## Vehicle Maintenance Flow

### Use Case: Schedule and Record Vehicle Maintenance

**Scenario**: A vehicle needs regular oil change and inspection.

#### 1. Check Vehicles Needing Maintenance

```javascript
const getVehiclesNeedingMaintenance = async () => {
    const response = await fetch(
        'http://localhost:5000/api/v1/vehicles',
        { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    const data = await response.json();
    
    // Filter vehicles that need maintenance
    const needsMaintenance = data.data.filter(vehicle => {
        if (vehicle.stats?.maintenanceDue) return true;
        
        // Check mileage
        if (vehicle.nextMaintenanceMileage && 
            vehicle.mileage >= vehicle.nextMaintenanceMileage) {
            return true;
        }
        
        // Check date
        if (vehicle.nextMaintenanceDate && 
            new Date() >= new Date(vehicle.nextMaintenanceDate)) {
            return true;
        }
        
        return false;
    });
    
    return needsMaintenance;
};

const vehiclesForMaintenance = await getVehiclesNeedingMaintenance();
console.log('Vehicles needing maintenance:', vehiclesForMaintenance);
```

#### 2. Update Vehicle Status

```javascript
const updateVehicleStatus = async (vehicleId, status) => {
    const response = await fetch(
        `http://localhost:5000/api/v1/vehicles/${vehicleId}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        }
    );
    
    return await response.json();
};

// Mark vehicle as in maintenance
await updateVehicleStatus(vehiclesForMaintenance[0]._id, 'maintenance');
```

#### 3. Record Maintenance

```javascript
const recordMaintenance = async (vehicleId, maintenanceData) => {
    try {
        const response = await fetch(
            `http://localhost:5000/api/v1/vehicles/${vehicleId}/maintenance`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(maintenanceData)
            }
        );
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error);
        }
        
        return data.data;
        
    } catch (error) {
        console.error('Maintenance recording failed:', error);
        throw error;
    }
};

const maintenance = await recordMaintenance(vehiclesForMaintenance[0]._id, {
    type: 'oil-change',
    description: 'Regular oil change and filter replacement',
    cost: 3500,
    performedBy: 'Auto Service Center',
    mileageAtService: 45000,
    nextMaintenanceDate: '2024-04-15',
    nextMaintenanceMileage: 50000,
    parts: [
        { name: 'Oil Filter', quantity: 1, cost: 500 },
        { name: 'Engine Oil 5L', quantity: 1, cost: 3000 }
    ],
    notes: 'All fluids checked and topped off',
    updateStatus: true,
    status: 'available' // Return to service
});
```

#### 4. Complete Maintenance Workflow

```javascript
const completeMaintenance Workflow = async (vehicleId) => {
    try {
        // 1. Get vehicle details
        const vehicleResponse = await fetch(
            `http://localhost:5000/api/v1/vehicles/${vehicleId}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const vehicleData = await vehicleResponse.json();
        const vehicle = vehicleData.data;
        
        // 2. Check for scheduled lessons
        const lessonsResponse = await fetch(
            `http://localhost:5000/api/v1/lessons?vehicleId=${vehicleId}&status=scheduled`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const lessonsData = await lessonsResponse.json();
        
        if (lessonsData.count > 0) {
            console.warn('Vehicle has scheduled lessons:', lessonsData.data);
            // Option: Reschedule or notify
        }
        
        // 3. Set status to maintenance
        await updateVehicleStatus(vehicleId, 'maintenance');
        
        // 4. Perform and record maintenance
        const maintenance = await recordMaintenance(vehicleId, {
            type: 'oil-change',
            description: 'Regular service',
            cost: 3500,
            performedBy: 'Auto Service Center',
            mileageAtService: vehicle.mileage,
            nextMaintenanceMileage: vehicle.mileage + 5000,
            updateStatus: true,
            status: 'available'
        });
        
        return {
            success: true,
            vehicle,
            maintenance,
            message: 'Maintenance completed successfully'
        };
        
    } catch (error) {
        console.error('Maintenance workflow failed:', error);
        throw error;
    }
};
```

---

## Student Progress Tracking

### Use Case: Track Student Learning Progress

#### 1. Get Student Progress

```javascript
const getStudentProgress = async (studentId) => {
    const response = await fetch(
        `http://localhost:5000/api/v1/students/${studentId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    const data = await response.json();
    return data.data.progress;
};

const progress = await getStudentProgress('64abc123def456789');
console.log('Progress:', progress);
// { theoryLessons: 5, practicalLessons: 12, theoryTestPassed: true, practicalTestPassed: false }
```

#### 2. Complete a Lesson and Update Progress

```javascript
const completeLesson = async (lessonId, rating, notes) => {
    const response = await fetch(
        `http://localhost:5000/api/v1/lessons/${lessonId}/complete`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rating, notes })
        }
    );
    
    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.error);
    }
    
    // Progress is automatically updated by the backend
    console.log('Lesson completed:', data.data);
    return data.data;
};

await completeLesson('64jkl012mno345678', 5, 'Great progress on parallel parking!');
```

#### 3. Calculate Readiness for Test

```javascript
const calculateTestReadiness = (progress) => {
    const requirements = {
        theory: {
            minLessons: 10,
            testPassed: true
        },
        practical: {
            minLessons: 20,
            testPassed: false
        }
    };
    
    const readiness = {
        theoryTest: {
            ready: progress.theoryLessons >= requirements.theory.minLessons,
            lessonsCompleted: progress.theoryLessons,
            lessonsRequired: requirements.theory.minLessons,
            testPassed: progress.theoryTestPassed
        },
        practicalTest: {
            ready: progress.practicalLessons >= requirements.practical.minLessons && 
                   progress.theoryTestPassed,
            lessonsCompleted: progress.practicalLessons,
            lessonsRequired: requirements.practical.minLessons,
            testPassed: progress.practicalTestPassed,
            prerequisite: 'Theory test must be passed'
        }
    };
    
    return readiness;
};

const readiness = calculateTestReadiness(progress);
console.log('Test readiness:', readiness);
```

---

## Report Generation

### Use Case: Generate Monthly Report

#### 1. Collect Report Data

```javascript
const generateMonthlyReport = async (year, month) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Get all data for the month
    const [students, lessons, payments, instructors, vehicles] = await Promise.all([
        fetch(`http://localhost:5000/api/v1/students/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json()),
        
        fetch(`http://localhost:5000/api/v1/lessons/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json()),
        
        fetch(`http://localhost:5000/api/v1/payments/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json()),
        
        fetch(`http://localhost:5000/api/v1/instructors/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json()),
        
        fetch(`http://localhost:5000/api/v1/vehicles/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json())
    ]);
    
    return {
        period: `${year}-${String(month).padStart(2, '0')}`,
        students: students.data,
        lessons: lessons.data,
        payments: payments.data,
        instructors: instructors.data,
        vehicles: vehicles.data
    };
};

const report = await generateMonthlyReport(2024, 1);
console.log('Monthly Report:', report);
```

#### 2. Format Report

```javascript
const formatReport = (reportData) => {
    return `
==============================================
   MONTHLY REPORT - ${reportData.period}
==============================================

STUDENTS
--------
Total Students: ${reportData.students.total}
New Registrations: ${reportData.students.recentlyRegistered}

LESSONS
-------
Total Lessons: ${reportData.lessons.total}
Completed: ${reportData.lessons.completed}
Scheduled: ${reportData.lessons.scheduled}
Cancelled: ${reportData.lessons.cancelled}
Completion Rate: ${reportData.lessons.completionRate}%

REVENUE
-------
Total Revenue: ${reportData.payments.totalRevenue} DZD
Paid: ${reportData.payments.totalPaid} payments
Pending: ${reportData.payments.totalPending} payments

INSTRUCTORS
-----------
Total Instructors: ${reportData.instructors.total}
Active: ${reportData.instructors.active}

VEHICLES
--------
Total Vehicles: ${reportData.vehicles.total}
Available: ${reportData.vehicles.available}
In Maintenance: ${reportData.vehicles.maintenance}

==============================================
    `;
};

console.log(formatReport(report));
```

---

## Complete Workflows

### Workflow 1: New Student Complete Journey

```javascript
const newStudentCompleteJourney = async (studentInfo) => {
    try {
        // 1. Register student
        const student = await registerStudent(studentInfo);
        console.log('✓ Student registered');
        
        // 2. Record initial payment
        const payment = await createInitialPayment(student._id);
        console.log('✓ Payment recorded');
        
        // 3. Schedule first theory lesson
        const theoryLesson = await completeBookingFlow(student._id, {
            date: '2024-01-20',
            time: '09:00',
            duration: 120,
            transmission: 'automatic',
            location: 'Classroom A'
        });
        console.log('✓ Theory lesson scheduled');
        
        // 4. Send welcome email (mock)
        console.log('✓ Welcome email sent');
        
        return {
            success: true,
            student,
            payment,
            firstLesson: theoryLesson
        };
        
    } catch (error) {
        console.error('Journey failed:', error);
        throw error;
    }
};
```

### Workflow 2: Daily Operations

```javascript
const performDailyOperations = async () => {
    try {
        // 1. Check today's lessons
        const today = new Date().toISOString().split('T')[0];
        const todayLessons = await fetch(
            `http://localhost:5000/api/v1/lessons?date=${today}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        ).then(r => r.json());
        
        console.log(`Today's lessons: ${todayLessons.count}`);
        
        // 2. Check vehicles needing maintenance
        const vehiclesForMaintenance = await getVehiclesNeedingMaintenance();
        console.log(`Vehicles needing maintenance: ${vehiclesForMaintenance.length}`);
        
        // 3. Check pending payments
        const pendingPayments = await fetch(
            'http://localhost:5000/api/v1/payments/pending',
            { headers: { 'Authorization': `Bearer ${token}` } }
        ).then(r => r.json());
        
        console.log(`Pending payments: ${pendingPayments.count}`);
        
        // 4. Generate daily summary
        return {
            date: today,
            lessons: todayLessons.count,
            maintenanceNeeded: vehiclesForMaintenance.length,
            pendingPayments: pendingPayments.count
        };
        
    } catch (error) {
        console.error('Daily operations failed:', error);
        throw error;
    }
};
```

---

## Related Documentation

- [Frontend Guide](./FRONTEND_GUIDE.md)
- [API Documentation](../api/)
- [Authentication Guide](./AUTHENTICATION.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

