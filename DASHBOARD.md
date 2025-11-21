# Dashboard Features Documentation

## Overview

The dashboard provides a comprehensive overview of the driving school management system with real-time statistics, trends, and actionable insights.

## Features

### 1. **Real-time Statistics**

The dashboard displays key metrics with trend indicators:

- **Total Students**: Shows total student count with monthly growth percentage
- **Active Instructors**: Displays currently active instructors
- **Available Vehicles**: Shows vehicles ready for lessons
- **Total Revenue**: Displays cumulative revenue with trend
- **Today's Lessons**: Shows lessons scheduled for today
- **Upcoming Lessons**: Displays lessons for the next 7 days
- **Completed Lessons**: Shows total completed lessons
- **Pending Payments**: Displays outstanding payment amounts

### 2. **Visual Analytics**

#### Lessons Chart
- Bar chart showing lesson activity over the selected period
- Supports multiple time periods: 7 days, 30 days, 90 days, 12 months
- Color-coded bars for easy visualization

#### Distribution Charts
- **Lessons by Type**: Shows breakdown of theory, practical, test preparation, and exam lessons
- **Lessons by Status**: Displays scheduled, completed, cancelled, and in-progress lessons
- **Payment Methods**: Shows payment distribution across different methods

### 3. **Activity Timeline**

Recent activities section displays:
- Newly scheduled lessons
- Payment transactions
- New student registrations
- Real-time updates with relative timestamps

### 4. **Quick Actions**

One-click navigation to common tasks:
- Add new student
- Schedule lesson
- Add vehicle
- Record payment

### 5. **Upcoming Lessons Widget**

Displays the next 5 upcoming lessons with:
- Date and time
- Student name
- Instructor assignment
- Vehicle details
- Lesson type badge

### 6. **Top Performers**

Shows top 5 instructors by completed lessons:
- Ranking display
- Instructor name
- Total lessons completed

## API Endpoints

### Dashboard Statistics
```
GET /api/v1/dashboard/stats
```

Returns comprehensive dashboard data including:
- Student, instructor, vehicle, lesson, and revenue statistics
- Trend calculations (percentage changes from previous period)
- Distribution data for charts
- Top performers

**Response Example:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "students": {
        "total": 150,
        "active": 120,
        "newThisMonth": 15,
        "trend": { "value": "12.5", "isPositive": true }
      },
      "instructors": {
        "total": 20,
        "active": 18
      },
      "vehicles": {
        "total": 25,
        "available": 20,
        "inMaintenance": 3
      },
      "lessons": {
        "total": 850,
        "today": 12,
        "upcoming": 45,
        "completed": 750,
        "scheduled": 100,
        "trend": { "value": "8.3", "isPositive": true }
      },
      "revenue": {
        "total": 125000,
        "pending": 15000,
        "thisMonth": 22000,
        "trend": { "value": "15.2", "isPositive": true }
      }
    },
    "distributions": {
      "lessonsByType": [...],
      "lessonsByStatus": [...],
      "paymentsByMethod": [...]
    },
    "topPerformers": {
      "instructors": [...]
    }
  }
}
```

### Recent Activities
```
GET /api/v1/dashboard/activities?limit=10
```

Returns recent system activities including lessons, payments, and student registrations.

### Chart Data
```
GET /api/v1/dashboard/charts?period=7d
```

Parameters:
- `period`: Time period for charts (7d, 30d, 90d, 12m)

Returns time-series data for:
- Lessons over time
- Revenue over time
- Student registrations over time

## Components

### StatCard
Displays a metric with optional trend indicator.

**Props:**
- `title`: Metric name
- `value`: Current value
- `icon`: Icon component
- `color`: Color theme (blue, green, yellow, red, purple, indigo)
- `trend`: Trend object with `value` and `isPositive`
- `subtitle`: Additional context

### RecentActivities
Timeline of recent system activities.

**Props:**
- `activities`: Array of activity objects
- `loading`: Loading state

### QuickActions
Grid of quick action buttons for common tasks.

### UpcomingLessons
Widget showing upcoming lessons.

**Props:**
- `lessons`: Array of lesson objects
- `loading`: Loading state

### SimpleBarChart
Bar chart for time-series data.

**Props:**
- `data`: Array of data points
- `label`: Chart title
- `color`: Bar color

### DistributionChart
Horizontal bar chart with legend for categorical data.

**Props:**
- `title`: Chart title
- `data`: Array of distribution data
- `type`: Chart type (default: 'doughnut')

### DashboardActions
Action buttons for export and print functionality.

**Props:**
- `onExport`: Export handler function
- `onPrint`: Print handler function

## Features Implementation

### Auto-refresh
The dashboard automatically refreshes data every 60 seconds to ensure users see the latest information.

### Export Functionality
Users can export dashboard statistics in CSV format:
- Click "Export" button
- Select "Export as CSV"
- File downloads with current date in filename

### Print Functionality
Users can print the dashboard:
- Click "Print" button
- Browser print dialog opens
- Print-specific styles ensure clean output

### Responsive Design
The dashboard is fully responsive:
- Mobile: Single column layout
- Tablet: 2-column grid
- Desktop: Multi-column grid with optimal spacing

## Error Handling

The dashboard gracefully handles errors:
- Shows loading states during data fetch
- Displays fallback UI if data unavailable
- Shows error messages for failed requests
- Returns default values to prevent crashes

## Performance Optimization

- Parallel API calls for faster loading
- Conditional rendering to avoid unnecessary re-renders
- Memoization of expensive calculations
- Lazy loading of components
- Debounced refresh to prevent excessive API calls

## Future Enhancements

Planned features for future releases:
- PDF export functionality
- Custom date range selection
- Interactive charts with drill-down
- Real-time WebSocket updates
- Customizable dashboard layouts
- Widget drag-and-drop
- Advanced filtering options
- Email reports scheduling
- Mobile app integration

## Maintenance

### Adding New Metrics
To add a new metric to the dashboard:

1. Update the backend controller:
```javascript
// backend/src/controllers/dashboard.controller.js
const newMetric = await Model.countDocuments({ /* query */ });
```

2. Add to response:
```javascript
res.status(200).json({
  data: {
    overview: {
      newMetric: { value, trend }
    }
  }
});
```

3. Add StatCard to frontend:
```jsx
<StatCard
  title="New Metric"
  value={stats.newMetric?.value || 0}
  icon={<Icon size={24} />}
  color="color"
  trend={stats.newMetric?.trend}
/>
```

### Updating Charts
To modify chart data:

1. Update chart data endpoint in controller
2. Modify chart component props
3. Update chart rendering logic if needed

## Troubleshooting

### Dashboard shows "No data available"
- Check backend server is running
- Verify database connection
- Check network requests in browser console
- Ensure user is authenticated

### Trends not showing
- Verify historical data exists
- Check trend calculation logic
- Ensure date ranges are correct

### Export not working
- Check browser console for errors
- Verify data format is correct
- Ensure user has necessary permissions

## Support

For issues or questions:
1. Check the main README.md
2. Review API documentation
3. Contact system administrator
