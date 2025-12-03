# Vehicle Model Documentation

## Overview

The Vehicle model represents cars and vehicles used for driving lessons at the driving school. It tracks vehicle information, maintenance history, and availability.

## Schema Definition

```javascript
const vehicleSchema = new mongoose.Schema({
  plateNumber: String,
  model: String,
  manufacturer: String,
  year: Number,
  color: String,
  vin: String,
  status: String,
  mileage: Number,
  fuelType: String,
  transmission: String,
  lastMaintenance: Date,
  nextMaintenanceDate: Date,
  nextMaintenanceMileage: Number,
  maintenanceHistory: [MaintenanceRecordSchema],
  insuranceDetails: Object,
  registrationDetails: Object
}, {
  timestamps: true
});
```

## Fields

### Basic Information

#### `plateNumber`
- **Type**: String
- **Required**: Yes
- **Unique**: Yes
- **Uppercase**: Yes (automatically converted)
- **Trim**: Yes
- **Description**: Vehicle license plate number
- **Example**: `"ABC-1234"`

#### `model`
- **Type**: String
- **Required**: Yes
- **Trim**: Yes
- **Description**: Vehicle model name
- **Example**: `"Corolla"`

#### `manufacturer`
- **Type**: String
- **Required**: Yes
- **Trim**: Yes
- **Description**: Vehicle manufacturer/brand
- **Example**: `"Toyota"`

#### `year`
- **Type**: Number
- **Required**: Yes
- **Min**: 1900
- **Max**: Current year + 1
- **Description**: Manufacturing year
- **Example**: `2020`

#### `color`
- **Type**: String
- **Required**: Yes
- **Lowercase**: Yes (automatically converted)
- **Description**: Vehicle color
- **Example**: `"silver"`

#### `vin`
- **Type**: String
- **Required**: Yes
- **Unique**: Yes
- **Uppercase**: Yes (automatically converted)
- **Trim**: Yes
- **Description**: Vehicle Identification Number (17 characters)
- **Validation**: Must be 17 characters
- **Example**: `"1HGBH41JXMN109186"`

---

### Operational Information

#### `status`
- **Type**: String
- **Required**: Yes
- **Lowercase**: Yes (automatically converted)
- **Enum**: `['available', 'in-use', 'maintenance', 'retired']`
- **Default**: `'available'`
- **Description**: Current vehicle status
- **Status Meanings**:
    - **available**: Ready for lessons
    - **in-use**: Currently being used in a lesson
    - **maintenance**: Under repair/maintenance
    - **retired**: No longer in service
- **Example**: `"available"`

#### `mileage`
- **Type**: Number
- **Required**: Yes
- **Min**: 0
- **Description**: Current odometer reading in kilometers/miles
- **Example**: `45000`

---

### Specifications

#### `fuelType`
- **Type**: String
- **Required**: Yes
- **Lowercase**: Yes (automatically converted)
- **Enum**: `['petrol', 'diesel', 'electric', 'hybrid']`
- **Description**: Type of fuel the vehicle uses
- **Example**: `"petrol"`

#### `transmission`
- **Type**: String
- **Required**: Yes
- **Lowercase**: Yes (automatically converted)
- **Enum**: `['manual', 'automatic']`
- **Description**: Transmission type
- **Example**: `"automatic"`

---

### Maintenance Information

#### `lastMaintenance`
- **Type**: Date
- **Required**: No
- **Description**: Date of last maintenance service
- **Example**: `"2024-01-15T00:00:00.000Z"`

#### `nextMaintenanceDate`
- **Type**: Date
- **Required**: No
- **Description**: Scheduled date for next maintenance
- **Example**: `"2024-04-15T00:00:00.000Z"`

#### `nextMaintenanceMileage`
- **Type**: Number
- **Required**: No
- **Min**: 0
- **Description**: Mileage at which next maintenance is due
- **Example**: `50000`

---

### Maintenance History

#### `maintenanceHistory`
An array of maintenance record objects.

```javascript
{
  date: Date,
  type: String,              // "oil-change", "tire-replacement", etc.
  description: String,
  cost: Number,
  mileage: Number,
  performedBy: String,       // Shop/mechanic name
  notes: String
}
```

**Maintenance Types**:
- `oil-change`
- `tire-replacement`
- `brake-service`
- `transmission-service`
- `general-inspection`
- `engine-repair`
- `bodywork`
- `other`

**Example**:
```javascript
{
  date: "2024-01-15",
  type: "oil-change",
  description: "Regular oil change and filter replacement",
  cost: 75.50,
  mileage: 45000,
  performedBy: "ABC Auto Shop",
  notes: "All fluids checked and topped off"
}
```

---

### Insurance Details

#### `insuranceDetails`
```javascript
{
  provider: String,          // Insurance company name
  policyNumber: String,      // Policy number
  expiryDate: Date,         // When policy expires
  coverageType: String,      // "comprehensive", "third-party", etc.
  premium: Number           // Annual premium amount
}
```

**Example**:
```javascript
{
  provider: "State Farm Insurance",
  policyNumber: "POL-123456",
  expiryDate: "2025-01-01T00:00:00.000Z",
  coverageType: "comprehensive",
  premium: 1200
}
```

---

### Registration Details

#### `registrationDetails`
```javascript
{
  registrationNumber: String,
  expiryDate: Date,
  state: String,            // State/province of registration
  ownerName: String
}
```

**Example**:
```javascript
{
  registrationNumber: "REG-789012",
  expiryDate: "2025-06-30T00:00:00.000Z",
  state: "New York",
  ownerName: "ABC Driving School Inc."
}
```

---

### Timestamps

#### `createdAt`
- **Type**: Date
- **Auto-generated**: Yes
- **Description**: When the vehicle was added to system

#### `updatedAt`
- **Type**: Date
- **Auto-generated**: Yes
- **Description**: When the vehicle record was last updated

---

## Virtual Fields

### `totalMaintenanceCost`
Calculates total cost of all maintenance.

```javascript
vehicleSchema.virtual('totalMaintenanceCost').get(function() {
  if (!this.maintenanceHistory || this.maintenanceHistory.length === 0) {
    return 0;
  }
  
  return this.maintenanceHistory.reduce((total, record) => {
    return total + (record.cost || 0);
  }, 0);
});
```

### `age`
Calculates vehicle age in years.

```javascript
vehicleSchema.virtual('age').get(function() {
  const currentYear = new Date().getFullYear();
  return currentYear - this.year;
});
```

### `maintenanceDue`
Checks if maintenance is due.

```javascript
vehicleSchema.virtual('maintenanceDue').get(function() {
  // Check by date
  if (this.nextMaintenanceDate) {
    const today = new Date();
    if (today >= new Date(this.nextMaintenanceDate)) {
      return true;
    }
  }
  
  // Check by mileage
  if (this.nextMaintenanceMileage) {
    if (this.mileage >= this.nextMaintenanceMileage) {
      return true;
    }
  }
  
  return false;
});
```

### `insuranceExpired`
Checks if insurance has expired.

```javascript
vehicleSchema.virtual('insuranceExpired').get(function() {
  if (!this.insuranceDetails?.expiryDate) return null;
  
  const today = new Date();
  return today > new Date(this.insuranceDetails.expiryDate);
});
```

---

## Indexes

### Unique Index on Plate Number
```javascript
vehicleSchema.index({ plateNumber: 1 }, { unique: true });
```

### Unique Index on VIN
```javascript
vehicleSchema.index({ vin: 1 }, { unique: true });
```

### Index on Status
```javascript
vehicleSchema.index({ status: 1 });
```

### Compound Index on Transmission and Status
```javascript
vehicleSchema.index({ transmission: 1, status: 1 });
```

---

## Validation Rules

### Plate Number
- **Required**: Yes
- **Unique**: Yes
- **Error Messages**:
    - Required: "Please provide plate number"
    - Unique: "Plate number already exists"

### Model
- **Required**: Yes
- **Min Length**: 1 character
- **Error Message**: "Please provide vehicle model"

### Manufacturer
- **Required**: Yes
- **Min Length**: 1 character
- **Error Message**: "Please provide manufacturer"

### Year
- **Required**: Yes
- **Min**: 1900
- **Max**: Current year + 1
- **Error Messages**:
    - Required: "Please provide manufacturing year"
    - Range: "Year must be between 1900 and [current year + 1]"

### VIN
- **Required**: Yes
- **Unique**: Yes
- **Length**: Exactly 17 characters
- **Error Messages**:
    - Required: "Please provide VIN"
    - Length: "VIN must be exactly 17 characters"
    - Unique: "VIN already exists"

### Status
- **Enum**: ['available', 'in-use', 'maintenance', 'retired']
- **Error Message**: "Invalid status value"

### Mileage
- **Required**: Yes
- **Min**: 0
- **Error Messages**:
    - Required: "Please provide current mileage"
    - Min: "Mileage cannot be negative"

### Fuel Type
- **Required**: Yes
- **Enum**: ['petrol', 'diesel', 'electric', 'hybrid']
- **Error Message**: "Fuel type must be petrol, diesel, electric, or hybrid"

### Transmission
- **Required**: Yes
- **Enum**: ['manual', 'automatic']
- **Error Message**: "Transmission must be manual or automatic"

---

## Example Usage

### Create Vehicle

```javascript
const vehicle = await Vehicle.create({
  plateNumber: 'ABC-1234',
  model: 'Corolla',
  manufacturer: 'Toyota',
  year: 2020,
  color: 'silver',
  vin: '1HGBH41JXMN109186',
  mileage: 45000,
  fuelType: 'petrol',
  transmission: 'automatic',
  insuranceDetails: {
    provider: 'State Farm',
    policyNumber: 'POL-123456',
    expiryDate: '2025-01-01',
    coverageType: 'comprehensive',
    premium: 1200
  },
  registrationDetails: {
    registrationNumber: 'REG-789012',
    expiryDate: '2025-06-30',
    state: 'New York',
    ownerName: 'ABC Driving School'
  }
});

console.log(vehicle.status); // "available" (default)
console.log(vehicle.age); // 4 (calculated)
```

### Find Vehicles

```javascript
// Find available vehicles
const available = await Vehicle.find({ status: 'available' });

// Find by transmission type
const automatic = await Vehicle.find({ transmission: 'automatic' });

// Find available automatic vehicles
const availableAutomatic = await Vehicle.find({
  status: 'available',
  transmission: 'automatic'
});

// Find vehicles needing maintenance
const needsMaintenance = await Vehicle.find({
  $or: [
    { mileage: { $gte: '$nextMaintenanceMileage' } },
    { nextMaintenanceDate: { $lte: new Date() } }
  ]
});
```

### Update Mileage

```javascript
// Simple update
await Vehicle.findByIdAndUpdate(vehicleId, {
  mileage: 46000
});

// Increment mileage
await Vehicle.findByIdAndUpdate(vehicleId, {
  $inc: { mileage: 50 } // Add 50 km
});
```

### Add Maintenance Record

```javascript
const vehicle = await Vehicle.findById(vehicleId);

vehicle.maintenanceHistory.push({
  date: new Date(),
  type: 'oil-change',
  description: 'Regular oil change',
  cost: 75.50,
  mileage: 45000,
  performedBy: 'ABC Auto Shop',
  notes: 'All fluids checked'
});

vehicle.lastMaintenance = new Date();
vehicle.nextMaintenanceDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
vehicle.nextMaintenanceMileage = vehicle.mileage + 5000;

await vehicle.save();
```

### Update Status

```javascript
// Put vehicle in maintenance
await Vehicle.findByIdAndUpdate(vehicleId, {
  status: 'maintenance'
});

// Return to service
await Vehicle.findByIdAndUpdate(vehicleId, {
  status: 'available'
});
```

---

## Common Queries

### Available Vehicles by Transmission
```javascript
const getAvailableVehicles = async (transmission) => {
  return await Vehicle.find({
    status: 'available',
    transmission: transmission || { $exists: true }
  });
};
```

### Vehicles Due for Maintenance
```javascript
const getDueForMaintenance = async () => {
  const today = new Date();
  
  return await Vehicle.find({
    $or: [
      { nextMaintenanceDate: { $lte: today } },
      { $expr: { $gte: ['$mileage', '$nextMaintenanceMileage'] } }
    ],
    status: { $ne: 'retired' }
  });
};
```

### Vehicles with Expired Insurance
```javascript
const today = new Date();

const expiredInsurance = await Vehicle.find({
  'insuranceDetails.expiryDate': { $lt: today }
});
```

### Vehicle Statistics
```javascript
const stats = await Vehicle.aggregate([
  {
    $group: {
      _id: null,
      total: { $sum: 1 },
      available: {
        $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
      },
      inMaintenance: {
        $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] }
      },
      avgMileage: { $avg: '$mileage' },
      totalMaintenanceCost: { $sum: '$totalMaintenanceCost' }
    }
  }
]);
```

---

## Aggregation Examples

### Fleet Overview

```javascript
const fleetOverview = await Vehicle.aggregate([
  {
    $facet: {
      byStatus: [
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ],
      byTransmission: [
        { $group: { _id: '$transmission', count: { $sum: 1 } } }
      ],
      byManufacturer: [
        { $group: { _id: '$manufacturer', count: { $sum: 1 } } }
      ],
      avgMileage: [
        { $group: { _id: null, avg: { $avg: '$mileage' } } }
      ],
      oldestVehicle: [
        { $sort: { year: 1 } },
        { $limit: 1 }
      ],
      newestVehicle: [
        { $sort: { year: -1 } },
        { $limit: 1 }
      ]
    }
  }
]);
```

### Maintenance Cost Analysis

```javascript
const maintenanceAnalysis = await Vehicle.aggregate([
  { $unwind: '$maintenanceHistory' },
  {
    $group: {
      _id: {
        vehicleId: '$_id',
        plateNumber: '$plateNumber'
      },
      totalCost: { $sum: '$maintenanceHistory.cost' },
      maintenanceCount: { $sum: 1 },
      avgCost: { $avg: '$maintenanceHistory.cost' },
      lastMaintenance: { $max: '$maintenanceHistory.date' }
    }
  },
  { $sort: { totalCost: -1 } }
]);
```

---

## Relationships

### With Lesson Model
Vehicles are used in lessons:

```javascript
const lessons = await Lesson.find({ vehicleId: vehicle._id });
```

### Check Vehicle Availability

```javascript
const isAvailable = async (vehicleId, date, time) => {
  const vehicle = await Vehicle.findById(vehicleId);
  
  // Check status
  if (vehicle.status !== 'available') {
    return { available: false, reason: `Vehicle is ${vehicle.status}` };
  }
  
  // Check for scheduled lessons
  const existingLesson = await Lesson.findOne({
    vehicleId,
    date,
    time,
    status: { $in: ['scheduled', 'in-progress'] }
  });
  
  if (existingLesson) {
    return { available: false, reason: 'Vehicle already scheduled' };
  }
  
  return { available: true };
};
```

---

## Business Logic

### Auto-Update Status Based on Lessons

```javascript
const updateVehicleStatus = async (vehicleId) => {
  const now = new Date();
  
  // Check if vehicle has active lesson
  const activeLesson = await Lesson.findOne({
    vehicleId,
    status: 'in-progress'
  });
  
  if (activeLesson) {
    await Vehicle.findByIdAndUpdate(vehicleId, {
      status: 'in-use'
    });
  } else {
    // Check if maintenance is due
    const vehicle = await Vehicle.findById(vehicleId);
    
    if (vehicle.maintenanceDue) {
      await Vehicle.findByIdAndUpdate(vehicleId, {
        status: 'maintenance'
      });
    } else {
      await Vehicle.findByIdAndUpdate(vehicleId, {
        status: 'available'
      });
    }
  }
};
```

### Calculate Maintenance Schedule

```javascript
const scheduleMaintenance = (vehicle, maintenanceInterval = 5000) => {
  const nextMileage = vehicle.mileage + maintenanceInterval;
  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + 3); // 3 months
  
  return {
    nextMaintenanceDate: nextDate,
    nextMaintenanceMileage: nextMileage
  };
};
```

---

## Best Practices

### 1. Check Uniqueness

```javascript
// Check plate number
const existingPlate = await Vehicle.findOne({ plateNumber });
if (existingPlate) {
  throw new Error('Plate number already exists');
}

// Check VIN
const existingVIN = await Vehicle.findOne({ vin });
if (existingVIN) {
  throw new Error('VIN already exists');
}
```

### 2. Validate Before Scheduling

```javascript
const vehicle = await Vehicle.findById(vehicleId);

if (vehicle.status !== 'available') {
  throw new Error(`Vehicle is ${vehicle.status}`);
}

if (vehicle.maintenanceDue) {
  throw new Error('Vehicle needs maintenance');
}
```

### 3. Track Mileage After Lessons

```javascript
// After completing lesson, update mileage
const lesson = await Lesson.findById(lessonId);
const estimatedDistance = lesson.duration * 0.5; // 0.5 km per minute

await Vehicle.findByIdAndUpdate(lesson.vehicleId, {
  $inc: { mileage: estimatedDistance }
});
```

### 4. Set Maintenance Reminders

```javascript
// Check weekly for maintenance due
const checkMaintenanceDue = async () => {
  const vehicles = await Vehicle.find({
    status: 'available',
    $or: [
      { nextMaintenanceDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } },
      { $expr: { $gte: ['$mileage', { $subtract: ['$nextMaintenanceMileage', 500] }] } }
    ]
  });
  
  // Send notifications for each vehicle
  vehicles.forEach(vehicle => {
    console.log(`Maintenance due soon for ${vehicle.plateNumber}`);
  });
};
```

---

## Related Models

- **Lesson Model**: Tracks lessons using vehicles
- **Instructor Model**: Instructors who drive vehicles

## Related Endpoints

- [Vehicles API](../api/VEHICLES.md)
- [Lessons API](../api/LESSONS.md)

---

## Database Collection

**Collection Name**: `vehicles`

**Example Document**:
```json
{
  "_id": "64ghi789jkl012345",
  "plateNumber": "ABC-1234",
  "model": "Corolla",
  "manufacturer": "Toyota",
  "year": 2020,
  "color": "silver",
  "vin": "1HGBH41JXMN109186",
  "status": "available",
  "mileage": 45000,
  "fuelType": "petrol",
  "transmission": "automatic",
  "lastMaintenance": "2024-01-15T00:00:00.000Z",
  "nextMaintenanceDate": "2024-04-15T00:00:00.000Z",
  "nextMaintenanceMileage": 50000,
  "maintenanceHistory": [
    {
      "date": "2024-01-15T00:00:00.000Z",
      "type": "oil-change",
      "description": "Regular oil change",
      "cost": 75.50,
      "mileage": 45000,
      "performedBy": "ABC Auto Shop",
      "notes": "All fluids checked"
    }
  ],
  "insuranceDetails": {
    "provider": "State Farm",
    "policyNumber": "POL-123456",
    "expiryDate": "2025-01-01T00:00:00.000Z",
    "coverageType": "comprehensive",
    "premium": 1200
  },
  "registrationDetails": {
    "registrationNumber": "REG-789012",
    "expiryDate": "2025-06-30T00:00:00.000Z",
    "state": "New York",
    "ownerName": "ABC Driving School"
  },
  "createdAt": "2019-06-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```