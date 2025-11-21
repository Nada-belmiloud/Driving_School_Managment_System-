# Payment Model Documentation

## Overview

The Payment model represents financial transactions between students and the driving school. It tracks payments for lessons, registration fees, exam fees, and other charges.

## Schema Definition

```javascript
const paymentSchema = new mongoose.Schema({
  studentId: ObjectId,
  amount: Number,
  method: String,
  status: String,
  date: Date,
  paidDate: Date,
  receiptNumber: String,
  description: String,
  category: String,
  transactionId: String,
  notes: String
}, {
  timestamps: true
});
```

## Fields

### Core Information

#### `studentId`
- **Type**: ObjectId
- **Ref**: 'Student'
- **Required**: Yes
- **Description**: Reference to the student making the payment
- **Index**: Yes (for fast queries)
- **Example**: `"64abc123def456789"`

#### `amount`
- **Type**: Number
- **Required**: Yes
- **Min**: 0
- **Description**: Payment amount in currency (e.g., dollars)
- **Validation**: Cannot be negative
- **Example**: `150.00`

---

### Payment Details

#### `method`
- **Type**: String
- **Required**: Yes
- **Lowercase**: Yes (automatically converted)
- **Enum**: `['cash', 'card', 'transfer', 'check']`
- **Default**: `'cash'`
- **Description**: Payment method used
- **Payment Methods**:
    - **cash**: Cash payment
    - **card**: Credit/debit card
    - **transfer**: Bank transfer
    - **check**: Check/cheque
- **Example**: `"card"`

#### `status`
- **Type**: String
- **Required**: Yes
- **Lowercase**: Yes (automatically converted)
- **Enum**: `['pending', 'paid', 'refunded', 'failed']`
- **Default**: `'pending'`
- **Description**: Current payment status
- **Status Meanings**:
    - **pending**: Payment expected but not yet received
    - **paid**: Payment received and confirmed
    - **refunded**: Payment was refunded to student
    - **failed**: Payment attempt failed
- **Index**: Yes
- **Example**: `"paid"`

---

### Dates and Tracking

#### `date`
- **Type**: Date
- **Required**: Yes
- **Default**: Current date/time
- **Description**: Date when payment was created/expected
- **Example**: `"2024-01-15T10:30:00.000Z"`

#### `paidDate`
- **Type**: Date
- **Required**: No
- **Description**: Date when payment was actually received
- **Usage**: Set when status changes to 'paid'
- **Example**: `"2024-01-15T14:20:00.000Z"`

#### `receiptNumber`
- **Type**: String
- **Required**: No
- **Unique**: Yes
- **Uppercase**: Yes (automatically converted)
- **Description**: Unique receipt number for the payment
- **Auto-generated**: Yes (if not provided)
- **Format**: `RCP-[timestamp]-[random]`
- **Example**: `"RCP-1705318200-A1B2C3D4"`

---

### Description and Categorization

#### `description`
- **Type**: String
- **Required**: No
- **Trim**: Yes
- **Description**: Description of what the payment is for
- **Example**: `"Payment for 5 practical driving lessons"`

#### `category`
- **Type**: String
- **Required**: No
- **Lowercase**: Yes (automatically converted)
- **Enum**: `['registration', 'lesson', 'exam-fee', 'material', 'other']`
- **Default**: `'lesson'`
- **Description**: Category of payment
- **Categories**:
    - **registration**: Initial registration fee
    - **lesson**: Payment for driving lessons
    - **exam-fee**: Fee for driving test
    - **material**: Study materials, books, etc.
    - **other**: Miscellaneous charges
- **Example**: `"lesson"`

---

### Additional Information

#### `transactionId`
- **Type**: String
- **Required**: No
- **Trim**: Yes
- **Description**: External transaction ID (for card/transfer payments)
- **Example**: `"TXN-ABC123XYZ789"`

#### `notes`
- **Type**: String
- **Required**: No
- **Description**: Additional notes about the payment
- **Use Cases**:
    - Special arrangements
    - Payment plan details
    - Refund reasons
- **Example**: `"First installment of 3-month payment plan"`

---

### Timestamps

#### `createdAt`
- **Type**: Date
- **Auto-generated**: Yes
- **Description**: When the payment record was created

#### `updatedAt`
- **Type**: Date
- **Auto-generated**: Yes
- **Description**: When the payment record was last updated

---

## Auto-Generation Features

### Receipt Number Generation

If no `receiptNumber` is provided, one is automatically generated:

```javascript
paymentSchema.pre('save', function(next) {
  if (!this.receiptNumber) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    this.receiptNumber = `RCP-${timestamp}-${random}`;
  }
  next();
});
```

**Format**: `RCP-[timestamp]-[random 8 chars]`
**Example**: `"RCP-1705318200-A1B2C3D4"`

---

## Indexes

### Index on Student ID
```javascript
paymentSchema.index({ studentId: 1 });
```
**Purpose**: Fast lookup of all payments for a student

### Index on Status
```javascript
paymentSchema.index({ status: 1 });
```
**Purpose**: Filter by payment status

### Index on Date
```javascript
paymentSchema.index({ date: -1 });
```
**Purpose**: Sort payments by date

### Unique Index on Receipt Number
```javascript
paymentSchema.index({ receiptNumber: 1 }, { unique: true, sparse: true });
```
**Purpose**: Ensure receipt numbers are unique

### Compound Index: Student + Status
```javascript
paymentSchema.index({ studentId: 1, status: 1 });
```
**Purpose**: Find pending/paid payments for a student

---

## Validation Rules

### Student ID
- **Required**: Yes
- **Error Message**: "Please provide student ID"

### Amount
- **Required**: Yes
- **Min**: 0
- **Error Messages**:
    - Required: "Please provide payment amount"
    - Min: "Amount cannot be negative"

### Method
- **Required**: Yes
- **Enum**: ['cash', 'card', 'transfer', 'check']
- **Error Messages**:
    - Required: "Please provide payment method"
    - Enum: "Invalid payment method"

### Status
- **Enum**: ['pending', 'paid', 'refunded', 'failed']
- **Error Message**: "Invalid payment status"

### Date
- **Required**: Yes
- **Error Message**: "Please provide payment date"

### Category
- **Enum**: ['registration', 'lesson', 'exam-fee', 'material', 'other']
- **Error Message**: "Invalid payment category"

---

## Example Usage

### Create Payment

```javascript
const payment = await Payment.create({
  studentId: '64abc123def456789',
  amount: 150.00,
  method: 'card',
  status: 'paid',
  paidDate: new Date(),
  description: 'Payment for 3 driving lessons',
  category: 'lesson',
  transactionId: 'TXN-123456'
});

console.log(payment.receiptNumber); // Auto-generated: "RCP-1705318200-A1B2C3D4"
```

### Find Payments

```javascript
// Find all payments for a student
const studentPayments = await Payment.find({ 
  studentId 
})
.sort({ date: -1 });

// Find pending payments
const pendingPayments = await Payment.find({ 
  status: 'pending' 
})
.populate('studentId', 'name email');

// Find payments in date range
const monthlyPayments = await Payment.find({
  date: {
    $gte: new Date('2024-01-01'),
    $lte: new Date('2024-01-31')
  },
  status: 'paid'
});

// Find by receipt number
const payment = await Payment.findOne({ 
  receiptNumber: 'RCP-1705318200-A1B2C3D4' 
});
```

### Update Payment Status

```javascript
// Mark as paid
await Payment.findByIdAndUpdate(paymentId, {
  status: 'paid',
  paidDate: new Date(),
  transactionId: 'TXN-123456'
});

// Refund payment
await Payment.findByIdAndUpdate(paymentId, {
  status: 'refunded',
  notes: 'Student cancelled course within refund period'
});

// Mark as failed
await Payment.findByIdAndUpdate(paymentId, {
  status: 'failed',
  notes: 'Card declined'
});
```

---

## Common Queries

### Student's Payment History
```javascript
const getStudentPayments = async (studentId) => {
  const payments = await Payment.find({ studentId })
    .sort({ date: -1 });
    
  const summary = await Payment.aggregate([
    { $match: { studentId: mongoose.Types.ObjectId(studentId) } },
    {
      $group: {
        _id: null,
        totalPaid: {
          $sum: { 
            $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] 
          }
        },
        totalPending: {
          $sum: { 
            $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] 
          }
        },
        paymentCount: { $sum: 1 }
      }
    }
  ]);
  
  return {
    payments,
    summary: summary[0]
  };
};
```

### Pending Payments Report
```javascript
const pendingPayments = await Payment.find({ 
  status: 'pending' 
})
.populate('studentId', 'name email phone')
.sort({ date: 1 });

const totalPending = await Payment.aggregate([
  { $match: { status: 'pending' } },
  { $group: { _id: null, total: { $sum: '$amount' } } }
]);
```

### Daily Revenue
```javascript
const getDailyRevenue = async (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const revenue = await Payment.aggregate([
    {
      $match: {
        paidDate: { $gte: startOfDay, $lte: endOfDay },
        status: 'paid'
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
        byMethod: {
          $push: {
            method: '$method',
            amount: '$amount'
          }
        }
      }
    }
  ]);
  
  return revenue[0];
};
```

### Payments by Category
```javascript
const categoryBreakdown = await Payment.aggregate([
  {
    $match: { status: 'paid' }
  },
  {
    $group: {
      _id: '$category',
      total: { $sum: '$amount' },
      count: { $sum: 1 }
    }
  },
  { $sort: { total: -1 } }
]);
```

---

## Aggregation Examples

### Monthly Financial Report

```javascript
const monthlyReport = await Payment.aggregate([
  {
    $match: {
      date: {
        $gte: new Date('2024-01-01'),
        $lte: new Date('2024-12-31')
      }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: '$date' },
        month: { $month: '$date' },
        status: '$status'
      },
      total: { $sum: '$amount' },
      count: { $sum: 1 }
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
          total: '$total',
          count: '$count'
        }
      },
      totalRevenue: { $sum: '$total' }
    }
  },
  { $sort: { '_id.year': -1, '_id.month': -1 } }
]);
```

### Payment Method Statistics

```javascript
const methodStats = await Payment.aggregate([
  {
    $match: { status: 'paid' }
  },
  {
    $group: {
      _id: '$method',
      totalAmount: { $sum: '$amount' },
      count: { $sum: 1 },
      avgAmount: { $avg: '$amount' }
    }
  },
  {
    $project: {
      method: '$_id',
      totalAmount: { $round: ['$totalAmount', 2] },
      count: 1,
      avgAmount: { $round: ['$avgAmount', 2] }
    }
  },
  { $sort: { totalAmount: -1 } }
]);
```

### Top Paying Students

```javascript
const topStudents = await Payment.aggregate([
  {
    $match: { status: 'paid' }
  },
  {
    $group: {
      _id: '$studentId',
      totalPaid: { $sum: '$amount' },
      paymentCount: { $sum: 1 },
      lastPayment: { $max: '$paidDate' }
    }
  },
  {
    $lookup: {
      from: 'students',
      localField: '_id',
      foreignField: '_id',
      as: 'student'
    }
  },
  { $unwind: '$student' },
  {
    $project: {
      studentName: '$student.name',
      studentEmail: '$student.email',
      totalPaid: { $round: ['$totalPaid', 2] },
      paymentCount: 1,
      lastPayment: 1
    }
  },
  { $sort: { totalPaid: -1 } },
  { $limit: 10 }
]);
```

### Overdue Payments

```javascript
const overduePayments = await Payment.aggregate([
  {
    $match: {
      status: 'pending',
      date: { $lt: new Date() }
    }
  },
  {
    $lookup: {
      from: 'students',
      localField: 'studentId',
      foreignField: '_id',
      as: 'student'
    }
  },
  { $unwind: '$student' },
  {
    $project: {
      studentName: '$student.name',
      studentEmail: '$student.email',
      studentPhone: '$student.phone',
      amount: 1,
      date: 1,
      daysOverdue: {
        $floor: {
          $divide: [
            { $subtract: [new Date(), '$date'] },
            1000 * 60 * 60 * 24
          ]
        }
      },
      description: 1
    }
  },
  { $sort: { daysOverdue: -1 } }
]);
```

---

## Relationships

### With Student Model

```javascript
// Get student with all payments
const student = await Student.findById(studentId);
const payments = await Payment.find({ studentId: student._id });

// Populate student in payment
const payment = await Payment.findById(paymentId)
  .populate('studentId', 'name email phone');

console.log(payment.studentId.name);
```

---

## Business Logic

### Check Student Payment Status

```javascript
const checkPaymentStatus = async (studentId) => {
  const pendingPayments = await Payment.find({
    studentId,
    status: 'pending'
  });
  
  const hasPendingPayments = pendingPayments.length > 0;
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  
  return {
    hasPendingPayments,
    totalPending,
    pendingCount: pendingPayments.length,
    canScheduleLesson: !hasPendingPayments // Example business rule
  };
};
```

### Generate Invoice

```javascript
const generateInvoice = async (paymentId) => {
  const payment = await Payment.findById(paymentId)
    .populate('studentId', 'name email address');
    
  const invoice = {
    receiptNumber: payment.receiptNumber,
    date: payment.date,
    paidDate: payment.paidDate,
    student: {
      name: payment.studentId.name,
      email: payment.studentId.email,
      address: payment.studentId.address
    },
    items: [
      {
        description: payment.description,
        amount: payment.amount
      }
    ],
    subtotal: payment.amount,
    tax: payment.amount * 0.1, // 10% tax
    total: payment.amount * 1.1,
    paymentMethod: payment.method,
    status: payment.status
  };
  
  return invoice;
};
```

### Process Refund

```javascript
const processRefund = async (paymentId, reason) => {
  const payment = await Payment.findById(paymentId);
  
  if (payment.status !== 'paid') {
    throw new Error('Can only refund paid payments');
  }
  
  // Update payment
  payment.status = 'refunded';
  payment.notes = `Refunded: ${reason}`;
  await payment.save();
  
  // Create refund record (negative payment)
  const refund = await Payment.create({
    studentId: payment.studentId,
    amount: -payment.amount,
    method: payment.method,
    status: 'paid',
    paidDate: new Date(),
    description: `Refund for ${payment.receiptNumber}`,
    category: 'other',
    notes: reason
  });
  
  return { payment, refund };
};
```

### Payment Plan

```javascript
const createPaymentPlan = async (studentId, totalAmount, installments) => {
  const installmentAmount = totalAmount / installments;
  const payments = [];
  
  for (let i = 0; i < installments; i++) {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i);
    
    const payment = await Payment.create({
      studentId,
      amount: installmentAmount,
      method: 'cash',
      status: 'pending',
      date: dueDate,
      description: `Installment ${i + 1} of ${installments}`,
      category: 'lesson',
      notes: `Payment plan: ${installments} installments`
    });
    
    payments.push(payment);
  }
  
  return payments;
};
```

---

## Best Practices

### 1. Always Record Paid Date

```javascript
// ✅ GOOD
await Payment.findByIdAndUpdate(paymentId, {
  status: 'paid',
  paidDate: new Date(),
  transactionId: 'TXN-123456'
});

// ❌ BAD
await Payment.findByIdAndUpdate(paymentId, {
  status: 'paid'
  // Missing paidDate!
});
```

### 2. Generate Receipts

```javascript
// Always generate receipt for paid payments
if (payment.status === 'paid' && !payment.receiptNumber) {
  payment.receiptNumber = generateReceiptNumber();
  await payment.save();
}
```

### 3. Validate Before Refunding

```javascript
// Check if payment can be refunded
if (payment.status !== 'paid') {
  throw new Error('Only paid payments can be refunded');
}

const daysSincePayment = (new Date() - payment.paidDate) / (1000 * 60 * 60 * 24);
if (daysSincePayment > 30) {
  throw new Error('Refund period has expired');
}
```

### 4. Track Transaction IDs

```javascript
// For card/transfer payments, always store transaction ID
if (payment.method === 'card' || payment.method === 'transfer') {
  if (!payment.transactionId) {
    throw new Error('Transaction ID required for card/transfer payments');
  }
}
```

---

## Related Models

- **Student Model**: Students making payments
- **Lesson Model**: Payments are often for lessons

## Related Endpoints

- [Payments API](../api/PAYMENTS.md)
- [Students API](../api/STUDENTS.md)

---

## Database Collection

**Collection Name**: `payments`

**Example Document**:
```json
{
  "_id": "64mno345pqr678901",
  "studentId": "64abc123def456789",
  "amount": 150.00,
  "method": "card",
  "status": "paid",
  "date": "2024-01-15T00:00:00.000Z",
  "paidDate": "2024-01-15T14:20:00.000Z",
  "receiptNumber": "RCP-1705318200-A1B2C3D4",
  "description": "Payment for 3 practical driving lessons",
  "category": "lesson",
  "transactionId": "TXN-ABC123XYZ789",
  "notes": "Payment processed via online portal",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T14:20:00.000Z"
}
```

---

## Statistics and KPIs

### Calculate Key Metrics

```javascript
const getPaymentKPIs = async () => {
  const stats = await Payment.aggregate([
    {
      $facet: {
        // Total paid
        totalRevenue: [
          { $match: { status: 'paid' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ],
        // Pending amount
        pendingAmount: [
          { $match: { status: 'pending' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ],
        // Payment count by status
        countByStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        // Average payment
        averagePayment: [
          { $match: { status: 'paid' } },
          { $group: { _id: null, avg: { $avg: '$amount' } } }
        ],
        // Collection rate
        collectionRate: [
          {
            $group: {
              _id: null,
              totalExpected: { $sum: '$amount' },
              totalPaid: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0]
                }
              }
            }
          },
          {
            $project: {
              rate: {
                $multiply: [
                  { $divide: ['$totalPaid', '$totalExpected'] },
                  100
                ]
              }
            }
          }
        ]
      }
    }
  ]);
  
  return stats[0];
};
```