// Utility functions for dashboard

/**
 * Export data to CSV format
 */
export function exportToCSV(data, filename = 'dashboard-data.csv') {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csv = headers.join(',') + '\n';
    
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            // Handle values with commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csv += values.join(',') + '\n';
    });

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Export dashboard stats to CSV
 */
export function exportDashboardStats(dashboardData) {
    if (!dashboardData?.overview) {
        console.warn('No dashboard data to export');
        return;
    }

    const overview = dashboardData.overview;
    const timestamp = new Date().toISOString().split('T')[0];
    
    const exportData = [
        {
            metric: 'Total Students',
            value: overview.students?.total || 0,
            change: overview.students?.trend?.isPositive ? `+${overview.students?.trend?.value}%` : `-${overview.students?.trend?.value}%`
        },
        {
            metric: 'Active Students',
            value: overview.students?.active || 0,
            change: '-'
        },
        {
            metric: 'New Students This Month',
            value: overview.students?.newThisMonth || 0,
            change: '-'
        },
        {
            metric: 'Total Instructors',
            value: overview.instructors?.total || 0,
            change: '-'
        },
        {
            metric: 'Active Instructors',
            value: overview.instructors?.active || 0,
            change: '-'
        },
        {
            metric: 'Total Vehicles',
            value: overview.vehicles?.total || 0,
            change: '-'
        },
        {
            metric: 'Available Vehicles',
            value: overview.vehicles?.available || 0,
            change: '-'
        },
        {
            metric: 'Total Lessons',
            value: overview.lessons?.total || 0,
            change: '-'
        },
        {
            metric: 'Scheduled Lessons',
            value: overview.lessons?.scheduled || 0,
            change: '-'
        },
        {
            metric: 'Completed Lessons',
            value: overview.lessons?.completed || 0,
            change: overview.lessons?.trend?.isPositive ? `+${overview.lessons?.trend?.value}%` : `-${overview.lessons?.trend?.value}%`
        },
        {
            metric: 'Total Revenue',
            value: overview.revenue?.total || 0,
            change: overview.revenue?.trend?.isPositive ? `+${overview.revenue?.trend?.value}%` : `-${overview.revenue?.trend?.value}%`
        },
        {
            metric: 'Revenue This Month',
            value: overview.revenue?.thisMonth || 0,
            change: '-'
        },
        {
            metric: 'Pending Payments',
            value: overview.revenue?.pending || 0,
            change: '-'
        }
    ];

    exportToCSV(exportData, `dashboard-stats-${timestamp}.csv`);
}

/**
 * Format currency
 */
export function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
    };
    
    return new Date(date).toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format relative time
 */
export function formatRelativeTime(date) {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current, previous) {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
}

/**
 * Prepare print view
 */
export function preparePrintView() {
    // Add print-specific styles
    const style = document.createElement('style');
    style.textContent = `
        @media print {
            .no-print {
                display: none !important;
            }
            body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            .print-break-before {
                page-break-before: always;
            }
            .print-break-after {
                page-break-after: always;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Trigger print dialog
    window.print();
    
    // Clean up
    setTimeout(() => {
        document.head.removeChild(style);
    }, 100);
}
