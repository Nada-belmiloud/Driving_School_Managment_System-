# Dashboard Testing Guide

## Prerequisites

Before testing the dashboard, ensure:

1. **MongoDB is running**
   ```bash
   # Check if MongoDB is running
   mongosh --eval "db.version()"
   ```

2. **Backend server is running**
   ```bash
   cd backend
   npm run dev
   # Server should start on http://localhost:5000
   ```

3. **Frontend server is running**
   ```bash
   cd frontend
   npm run dev
   # Frontend should start on http://localhost:3000
   ```

## Testing Steps

### 1. Access the Dashboard

1. Navigate to `http://localhost:3000/login`
2. Log in with admin credentials
3. You should be redirected to `/dashboard/admin`

### 2. Verify Statistics Display

Check that the following metrics are displayed:

**Main Statistics:**
- Total Students (with trend indicator)
- Active Instructors
- Available Vehicles
- Total Revenue (with trend indicator)

**Secondary Statistics:**
- Today's Lessons
- Upcoming Lessons (next 7 days)
- Completed Lessons
- Pending Payments

Each stat card should show:
- Icon with appropriate color
- Current value
- Subtitle with context
- Trend arrow (where applicable)

### 3. Test Interactive Features

#### Auto Refresh
- Wait 60 seconds
- Dashboard should automatically refresh data
- No page reload should occur

#### Manual Refresh
- Click the "Refresh" button
- Button should show spinning icon while loading
- Data should update

#### Export to CSV
- Click "Export" button
- Select "Export as CSV"
- File should download with format: `dashboard-stats-YYYY-MM-DD.csv`
- Open the CSV and verify data is formatted correctly

#### Print
- Click "Print" button
- Browser print dialog should open
- Preview should show:
  - No navigation/sidebar
  - No action buttons
  - Clean layout optimized for paper
  - All charts and stats visible

### 4. Verify Visual Components

#### Charts
- **Lessons This Week**: Bar chart showing daily lessons
- **Lessons by Type**: Distribution chart with legend
- **Lessons by Status**: Distribution chart with percentages
- **Payment Methods**: Distribution with amounts

#### Quick Actions
- Click each action button
- Should navigate to correct page:
  - Add Student → `/dashboard/admin/students`
  - Schedule Lesson → `/dashboard/admin/lessons`
  - Add Vehicle → `/dashboard/admin/vehicles`
  - Record Payment → `/dashboard/admin/payments`

#### Upcoming Lessons Widget
- Should display up to 5 upcoming lessons
- Each lesson should show:
  - Date and time
  - Student name
  - Instructor name
  - Vehicle plate number
  - Lesson type badge (color-coded)

#### Recent Activities
- Should display up to 10 recent activities
- Activities should include:
  - Icon (color-coded by type)
  - Description
  - Relative timestamp (e.g., "5 mins ago")
- Types: Lessons, Payments, Student registrations

#### Top Performers
- Should display top 5 instructors
- Each should show:
  - Ranking (#1, #2, etc.)
  - Instructor name
  - Number of completed lessons

### 5. Test Responsive Design

#### Desktop (> 1024px)
- 4-column grid for stats
- 3-column layout (2 for charts, 1 for sidebar widgets)
- All elements visible

#### Tablet (768px - 1024px)
- 2-column grid for stats
- Charts stack vertically
- Widgets in sidebar

#### Mobile (< 768px)
- Single column layout
- All cards stack vertically
- Quick actions grid adapts to 2 columns

### 6. Test Loading States

To test loading states:
1. Open browser DevTools
2. Go to Network tab
3. Set throttling to "Slow 3G"
4. Refresh the page
5. Verify:
   - Skeleton loaders show for each section
   - No content jumps or layout shifts
   - Smooth transition from loading to loaded

### 7. Test Error Handling

To test error handling:
1. Stop the backend server
2. Refresh the dashboard
3. Verify:
   - Default/fallback values show (0s)
   - No JavaScript errors in console
   - Warning message displayed
   - UI remains functional

### 8. Verify API Endpoints

Test each endpoint directly:

```bash
# Get dashboard stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/v1/dashboard/stats

# Get recent activities
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/v1/dashboard/activities?limit=10

# Get chart data
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/v1/dashboard/charts?period=7d
```

Expected response format:
```json
{
  "success": true,
  "data": { ... }
}
```

## Common Issues and Solutions

### Issue: Dashboard shows all zeros

**Solution:**
- Ensure database has sample data
- Check backend console for errors
- Verify MongoDB connection

### Issue: Auto-refresh not working

**Solution:**
- Check browser console for errors
- Verify useEffect is not unmounting
- Ensure token is valid

### Issue: Charts not displaying

**Solution:**
- Check if data is in correct format
- Verify chart component receives data
- Check for JavaScript errors

### Issue: Export not downloading

**Solution:**
- Check browser download settings
- Verify data is available
- Check browser console for errors

### Issue: Print layout broken

**Solution:**
- Check print CSS in globals.css
- Verify no-print classes applied
- Test in different browsers

## Performance Benchmarks

Expected performance metrics:

- **Initial Load**: < 2 seconds (with data)
- **Auto Refresh**: < 500ms (data only)
- **Manual Refresh**: < 500ms
- **Export to CSV**: < 100ms
- **Page Size**: ~135 KB (compressed)

## Browser Compatibility

Tested and working on:
- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Safari 17+
- ✅ Edge 120+

## Accessibility Testing

Verify:
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen readers can navigate the dashboard
- [ ] Alt text provided for icons and images

## Security Testing

Verify:
- [ ] Dashboard requires authentication
- [ ] API endpoints check authorization
- [ ] No sensitive data in localStorage
- [ ] JWT tokens properly validated
- [ ] No SQL/NoSQL injection vulnerabilities

## Reporting Issues

When reporting issues, include:
1. Browser and version
2. Steps to reproduce
3. Expected vs actual behavior
4. Console errors (if any)
5. Network tab screenshot (if API-related)

## Success Criteria

Dashboard is working correctly if:
- ✅ All statistics display correctly
- ✅ Charts render with data
- ✅ Auto-refresh works
- ✅ Export downloads CSV
- ✅ Print layout is clean
- ✅ Responsive on all devices
- ✅ No console errors
- ✅ Loading states work
- ✅ Error handling graceful
- ✅ Performance meets benchmarks
