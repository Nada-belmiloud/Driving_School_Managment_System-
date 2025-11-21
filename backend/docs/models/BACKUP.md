# Backup Model Documentation

## Overview

The Backup model tracks system backups created by administrators. It maintains a record of all backup operations, their status, and restoration history.

## Schema Definition

```javascript
const backupSchema = new mongoose.Schema({
  admin: ObjectId,
  type: String,
  status: String,
  sizeMB: Number,
  retentionDays: Number,
  notes: String,
  restoredAt: Date
}, {
  timestamps: true
});
```

## Fields

### Core Information

#### `admin`
- **Type**: ObjectId
- **Ref**: 'Admin'
- **Required**: Yes
- **Description**: Reference to the admin who created the backup
- **Index**: Yes
- **Example**: `"64abc123def456789"`

---

### Backup Details

#### `type`
- **Type**: String
- **Required**: Yes
- **Lowercase**: Yes (automatically converted)
- **Enum**: `['manual', 'automatic']`
- **Default**: `'manual'`
- **Description**: How the backup was initiated
- **Types**:
    - **manual**: Admin manually triggered backup
    - **automatic**: Scheduled/automatic backup
- **Example**: `"manual"`

#### `status`
- **Type**: String
- **Required**: Yes
- **Lowercase**: Yes (automatically converted)
- **Enum**: `['pending', 'completed', 'failed', 'restored']`
- **Default**: `'pending'`
- **Description**: Current status of the backup
- **Status Meanings**:
    - **pending**: Backup is being created
    - **completed**: Backup successfully created
    - **failed**: Backup creation failed
    - **restored**: Backup was used to restore data
- **Index**: Yes
- **Example**: `"completed"`

#### `sizeMB`
- **Type**: Number
- **Required**: No
- **Min**: 0
- **Description**: Backup file size in megabytes
- **Example**: `245.5`

---

### Retention and Management

#### `retentionDays`
- **Type**: Number
- **Required**: Yes
- **Default**: 30
- **Min**: 1
- **Max**: 365
- **Description**: How many days to keep the backup before auto-deletion
- **Common Values**:
    - 7 days: Weekly backups
    - 30 days: Monthly retention
    - 90 days: Quarterly retention
    - 365 days: Yearly retention
- **Example**: `30`

---

### Additional Information

#### `notes`
- **Type**: String
- **Required**: No
- **Description**: Additional notes about the backup
- **Use Cases**:
    - Reason for manual backup
    - Special circumstances
    - Pre-restore system state
- **Example**: `"Backup before major system update"`

#### `restoredAt`
- **Type**: Date
- **Required**: No
- **Description**: Date and time when this backup was used to restore data
- **Usage**: Set when backup is restored
- **Example**: `"2024-01-20T15:30:00.000Z"`

---

### Timestamps

#### `createdAt`
- **Type**: Date
- **Auto-generated**: Yes
- **Description**: When the backup was initiated

#### `updatedAt`
- **Type**: Date
- **Auto-generated**: Yes
- **Description**: When the backup record was last updated

---

## Indexes

### Index on Admin
```javascript
backupSchema.index({ admin: 1 });
```
**Purpose**: Find all backups created by an admin

### Index on Status
```javascript
backupSchema.index({ status: 1 });
```
**Purpose**: Filter by backup status

### Index on Created Date
```javascript
backupSchema.index({ createdAt: -1 });
```
**Purpose**: Sort backups by date (newest first)

### Index on Type
```javascript
backupSchema.index({ type: 1 });
```
**Purpose**: Filter by backup type

---

## Validation Rules

### Admin
- **Required**: Yes
- **Error Message**: "Please provide admin ID"

### Type
- **Required**: Yes
- **Enum**: ['manual', 'automatic']
- **Error Messages**:
    - Required: "Please provide backup type"
    - Enum: "Type must be manual or automatic"

### Status
- **Enum**: ['pending', 'completed', 'failed', 'restored']
- **Error Message**: "Invalid backup status"

### Size MB
- **Min**: 0
- **Error Message**: "Size cannot be negative"

### Retention Days
- **Required**: Yes
- **Min**: 1
- **Max**: 365
- **Error Messages**:
    - Required: "Please provide retention days"
    - Range: "Retention must be between 1 and 365 days"

---

## Example Usage

### Create Backup

```javascript
const backup = await Backup.create({
  admin: adminId,
  type: 'manual',
  status: 'pending',
  retentionDays: 30,
  notes: 'Pre-upgrade backup'
});

// Simulate backup process
setTimeout(async () => {
  backup.status = 'completed';
  backup.sizeMB = Math.random() * 500; // Random size
  await backup.save();
}, 5000);
```

### Find Backups

```javascript
// Find all backups
const allBackups = await Backup.find()
  .populate('admin', 'name email')
  .sort({ createdAt: -1 });

// Find completed backups
const completed = await Backup.find({ status: 'completed' });

// Find recent backups (last 7 days)
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

const recentBackups = await Backup.find({
  createdAt: { $gte: sevenDaysAgo }
});

// Find backups by admin
const adminBackups = await Backup.find({ admin: adminId })
  .sort({ createdAt: -1 });
```

### Update Backup Status

```javascript
// Mark as completed
await Backup.findByIdAndUpdate(backupId, {
  status: 'completed',
  sizeMB: 245.5
});

// Mark as failed
await Backup.findByIdAndUpdate(backupId, {
  status: 'failed',
  notes: 'Database connection timeout'
});

// Mark as restored
await Backup.findByIdAndUpdate(backupId, {
  status: 'restored',
  restoredAt: new Date()
});
```

---

## Common Queries

### Latest Successful Backup
```javascript
const latestBackup = await Backup.findOne({ 
  status: 'completed' 
})
.sort({ createdAt: -1 });
```

### Backups Due for Deletion
```javascript
const backupsDueForDeletion = await Backup.find({
  status: 'completed',
  $expr: {
    $lt: [
      { $add: ['$createdAt', { $multiply: ['$retentionDays', 24 * 60 * 60 * 1000] }] },
      new Date()
    ]
  }
});
```

### Total Backup Size
```javascript
const totalSize = await Backup.aggregate([
  {
    $match: { status: 'completed' }
  },
  {
    $group: {
      _id: null,
      totalSizeMB: { $sum: '$sizeMB' },
      count: { $sum: 1 }
    }
  }
]);
```

### Backup Success Rate
```javascript
const successRate = await Backup.aggregate([
  {
    $group: {
      _id: null,
      total: { $sum: 1 },
      successful: {
        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
      },
      failed: {
        $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
      }
    }
  },
  {
    $project: {
      total: 1,
      successful: 1,
      failed: 1,
      successRate: {
        $multiply: [
          { $divide: ['$successful', '$total'] },
          100
        ]
      }
    }
  }
]);
```

---

## Aggregation Examples

### Backup Statistics

```javascript
const backupStats = await Backup.aggregate([
  {
    $facet: {
      // Count by status
      byStatus: [
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ],
      // Count by type
      byType: [
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ],
      // Total and average size
      sizeStats: [
        {
          $match: { status: 'completed', sizeMB: { $exists: true } }
        },
        {
          $group: {
            _id: null,
            totalSizeMB: { $sum: '$sizeMB' },
            avgSizeMB: { $avg: '$sizeMB' },
            maxSizeMB: { $max: '$sizeMB' },
            minSizeMB: { $min: '$sizeMB' }
          }
        }
      ],
      // Recent activity
      recentActivity: [
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'admins',
            localField: 'admin',
            foreignField: '_id',
            as: 'adminInfo'
          }
        },
        { $unwind: '$adminInfo' },
        {
          $project: {
            type: 1,
            status: 1,
            createdAt: 1,
            adminName: '$adminInfo.name'
          }
        }
      ]
    }
  }
]);
```

### Monthly Backup Report

```javascript
const monthlyReport = await Backup.aggregate([
  {
    $group: {
      _id: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        status: '$status'
      },
      count: { $sum: 1 },
      totalSize: { $sum: '$sizeMB' }
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
          count: '$count',
          size: '$totalSize'
        }
      },
      totalBackups: { $sum: '$count' },
      totalSize: { $sum: '$totalSize' }
    }
  },
  { $sort: { '_id.year': -1, '_id.month': -1 } }
]);
```

### Admin Backup Activity

```javascript
const adminActivity = await Backup.aggregate([
  {
    $group: {
      _id: '$admin',
      totalBackups: { $sum: 1 },
      manualBackups: {
        $sum: { $cond: [{ $eq: ['$type', 'manual'] }, 1, 0] }
      },
      successfulBackups: {
        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
      },
      lastBackup: { $max: '$createdAt' }
    }
  },
  {
    $lookup: {
      from: 'admins',
      localField: '_id',
      foreignField: '_id',
      as: 'admin'
    }
  },
  { $unwind: '$admin' },
  {
    $project: {
      adminName: '$admin.name',
      adminEmail: '$admin.email',
      totalBackups: 1,
      manualBackups: 1,
      successfulBackups: 1,
      lastBackup: 1
    }
  },
  { $sort: { totalBackups: -1 } }
]);
```

---

## Relationships

### With Admin Model

```javascript
// Get admin who created backup
const backup = await Backup.findById(backupId)
  .populate('admin', 'name email');

console.log(backup.admin.name);

// Update admin's last backup time
await Admin.findByIdAndUpdate(adminId, {
  'backupSettings.lastBackupAt': new Date()
});
```

---

## Business Logic

### Auto-Delete Old Backups

```javascript
const deleteOldBackups = async () => {
  const now = new Date();
  
  const oldBackups = await Backup.find({
    status: 'completed',
    $expr: {
      $lt: [
        {
          $add: [
            '$createdAt',
            { $multiply: ['$retentionDays', 24 * 60 * 60 * 1000] }
          ]
        },
        now
      ]
    }
  });
  
  for (const backup of oldBackups) {
    // Delete backup file from storage
    // await deleteBackupFile(backup._id);
    
    // Delete database record
    await Backup.findByIdAndDelete(backup._id);
    
    console.log(`Deleted backup ${backup._id} (retention period expired)`);
  }
  
  return oldBackups.length;
};
```

### Create Scheduled Backup

```javascript
const createScheduledBackup = async () => {
  const adminId = await getSystemAdminId(); // Get system admin
  
  const backup = await Backup.create({
    admin: adminId,
    type: 'automatic',
    status: 'pending',
    retentionDays: 30,
    notes: 'Scheduled automatic backup'
  });
  
  try {
    // Perform backup
    const backupFile = await performBackup();
    
    backup.status = 'completed';
    backup.sizeMB = backupFile.size / (1024 * 1024);
    await backup.save();
    
    console.log('Automatic backup completed successfully');
    return backup;
  } catch (error) {
    backup.status = 'failed';
    backup.notes = `Failed: ${error.message}`;
    await backup.save();
    
    console.error('Automatic backup failed:', error);
    throw error;
  }
};
```

### Restore from Backup

```javascript
const restoreFromBackup = async (backupId, adminId) => {
  const backup = await Backup.findById(backupId);
  
  if (!backup) {
    throw new Error('Backup not found');
  }
  
  if (backup.status !== 'completed') {
    throw new Error('Can only restore from completed backups');
  }
  
  try {
    // Create pre-restore backup
    const preRestoreBackup = await Backup.create({
      admin: adminId,
      type: 'manual',
      status: 'completed',
      retentionDays: 7,
      notes: 'Pre-restore backup'
    });
    
    // Perform restore
    await performRestore(backup._id);
    
    // Update backup record
    backup.status = 'restored';
    backup.restoredAt = new Date();
    await backup.save();
    
    return {
      success: true,
      backup,
      preRestoreBackup
    };
  } catch (error) {
    throw new Error(`Restore failed: ${error.message}`);
  }
};
```

### Check Backup Health

```javascript
const checkBackupHealth = async () => {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // Check if there's a recent successful backup
  const recentBackup = await Backup.findOne({
    status: 'completed',
    createdAt: { $gte: oneDayAgo }
  });
  
  // Count failed backups in last week
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentFailures = await Backup.countDocuments({
    status: 'failed',
    createdAt: { $gte: oneWeekAgo }
  });
  
  // Calculate total backup size
  const sizeStats = await Backup.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$sizeMB' } } }
  ]);
  
  const health = {
    hasRecentBackup: !!recentBackup,
    lastSuccessfulBackup: recentBackup?.createdAt,
    recentFailures,
    totalStorageUsedMB: sizeStats[0]?.total || 0,
    status: 'healthy'
  };
  
  // Determine overall health status
  if (!health.hasRecentBackup) {
    health.status = 'critical';
    health.issues = ['No successful backup in last 24 hours'];
  } else if (health.recentFailures > 3) {
    health.status = 'warning';
    health.issues = ['Multiple backup failures in last week'];
  }
  
  return health;
};
```

---

## Best Practices

### 1. Always Track Backup Creator

```javascript
// GOOD
const backup = await Backup.create({
  admin: req.admin._id, // From auth middleware
  type: 'manual',
  notes: 'User-initiated backup'
});

// BAD
const backup = await Backup.create({
  type: 'manual'
  // Missing admin!
});
```

### 2. Set Appropriate Retention

```javascript
// Different retention for different backup types
const retentionDays = {
  daily: 7,
  weekly: 30,
  monthly: 90,
  yearly: 365,
  critical: 180
};

await Backup.create({
  admin: adminId,
  type: 'automatic',
  retentionDays: retentionDays.weekly,
  notes: 'Weekly automatic backup'
});
```

### 3. Handle Backup Failures

```javascript
try {
  const backup = await Backup.create({
    admin: adminId,
    type: 'manual',
    status: 'pending'
  });
  
  const result = await performBackup();
  
  backup.status = 'completed';
  backup.sizeMB = result.size;
  await backup.save();
} catch (error) {
  await Backup.findByIdAndUpdate(backup._id, {
    status: 'failed',
    notes: `Error: ${error.message}`
  });
  
  // Notify admins
  await notifyAdmins('Backup failed', error.message);
}
```

### 4. Regular Cleanup

```javascript
// Run daily cleanup job
const cleanupOldBackups = async () => {
  const deleted = await deleteOldBackups();
  console.log(`Cleanup completed: ${deleted} old backups deleted`);
};

// Schedule: Run every day at 2 AM
// cron.schedule('0 2 * * *', cleanupOldBackups);
```

---

## Automated Backup Strategies

### Daily Backups

```javascript
const scheduleDailyBackup = async () => {
  const systemAdmin = await Admin.findOne({ role: 'super-admin' });
  
  return await Backup.create({
    admin: systemAdmin._id,
    type: 'automatic',
    status: 'pending',
    retentionDays: 7,
    notes: 'Daily automatic backup'
  });
};
```

### Before Critical Operations

```javascript
const createPreOperationBackup = async (adminId, operation) => {
  return await Backup.create({
    admin: adminId,
    type: 'manual',
    status: 'completed',
    retentionDays: 30,
    notes: `Pre-${operation} backup`
  });
};

// Usage
await createPreOperationBackup(adminId, 'database-migration');
```

---

## Related Models

- **Admin Model**: Admins who create backups

## Related Endpoints

- [Settings API - Backups](../api/SETTINGS.md#backups)

---

## Database Collection

**Collection Name**: `backups`

**Example Document**:
```json
{
  "_id": "64pqr678stu901234",
  "admin": "64abc123def456789",
  "type": "manual",
  "status": "completed",
  "sizeMB": 245.5,
  "retentionDays": 30,
  "notes": "Pre-upgrade backup before v2.0 deployment",
  "restoredAt": null,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:15:00.000Z"
}
```

---

## Monitoring and Alerts

### Backup Monitoring Dashboard

```javascript
const getBackupDashboard = async () => {
  const dashboard = await Backup.aggregate([
    {
      $facet: {
        // Recent backups
        recentBackups: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'admins',
              localField: 'admin',
              foreignField: '_id',
              as: 'adminInfo'
            }
          }
        ],
        // Success rate (last 30 days)
        thirtyDayStats: [
          {
            $match: {
              createdAt: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              successful: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
              }
            }
          }
        ],
        // Storage usage
        storageUsage: [
          { $match: { status: 'completed' } },
          {
            $group: {
              _id: null,
              totalSizeMB: { $sum: '$sizeMB' },
              count: { $sum: 1 }
            }
          }
        ],
        // Next cleanup
        expiringBackups: [
          {
            $match: { status: 'completed' }
          },
          {
            $project: {
              expiryDate: {
                $add: [
                  '$createdAt',
                  { $multiply: ['$retentionDays', 24 * 60 * 60 * 1000] }
                ]
              }
            }
          },
          { $sort: { expiryDate: 1 } },
          { $limit: 5 }
        ]
      }
    }
  ]);
  
  return dashboard[0];
};
```