'use client';

import { useAuth } from '@/hooks/useAuth';
import { useFetch } from '@/hooks/useFetch';
import { dashboardAPI, lessonsAPI } from '@/lib/api';
import { exportDashboardStats, preparePrintView } from '@/lib/dashboardUtils';
import Loader from '@/components/Loader';
import StatCard from '@/components/StatCard';
import RecentActivities from '@/components/RecentActivities';
import QuickActions from '@/components/QuickActions';
import UpcomingLessons from '@/components/UpcomingLessons';
import DistributionChart from '@/components/DistributionChart';
import SimpleBarChart from '@/components/SimpleBarChart';
import DashboardActions from '@/components/DashboardActions';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Users, Car, Calendar, DollarSign, TrendingUp, BookOpen, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth(true, ['admin', 'super-admin']);
    const [refreshKey, setRefreshKey] = useState(0);

    // Fetch dashboard data
    const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useFetch(
        () => dashboardAPI.getStats(),
        [refreshKey]
    );

    const { data: activitiesData, loading: activitiesLoading } = useFetch(
        () => dashboardAPI.getActivities(10),
        [refreshKey]
    );

    const { data: upcomingLessonsData, loading: lessonsLoading } = useFetch(
        () => lessonsAPI.getUpcoming(5),
        [refreshKey]
    );

    const { data: chartData, loading: chartLoading } = useFetch(
        () => dashboardAPI.getCharts('7d'),
        [refreshKey]
    );

    // Auto refresh every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setRefreshKey(prev => prev + 1);
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    // Export handlers
    const handleExport = (format) => {
        if (format === 'csv') {
            exportDashboardStats(dashboardData?.data);
        } else if (format === 'pdf') {
            // PDF export could be implemented with a library like jsPDF
            alert('PDF export will be available in a future update');
        }
    };

    const handlePrint = () => {
        preparePrintView();
    };

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    if (authLoading) return <Loader fullScreen />;

    const stats = dashboardData?.data?.overview || {};
    const distributions = dashboardData?.data?.distributions || {};
    const topPerformers = dashboardData?.data?.topPerformers || {};
    const recentData = dashboardData?.data?.recent || {};
    
    const activities = activitiesData?.data || [];
    const upcomingLessons = upcomingLessonsData?.data || [];
    const charts = chartData?.data || {};

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar userRole={user?.role} className="no-print" />
            <main className="flex-1 p-6 overflow-auto">
                <Navbar user={user} className="no-print" />

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
                        <p className="text-gray-600">Welcome back, {user?.name}! Here's what's happening today.</p>
                    </div>
                    <div className="flex items-center gap-3 no-print">
                        <button
                            onClick={handleRefresh}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            title="Refresh Dashboard"
                            disabled={dashboardLoading}
                        >
                            <RefreshCw className={`w-4 h-4 ${dashboardLoading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <DashboardActions onExport={handleExport} onPrint={handlePrint} />
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Students"
                        value={dashboardLoading ? '...' : stats.students?.total || 0}
                        icon={<Users size={24} />}
                        color="blue"
                        trend={stats.students?.trend}
                        subtitle={`${stats.students?.newThisMonth || 0} new this month`}
                    />
                    <StatCard
                        title="Active Instructors"
                        value={dashboardLoading ? '...' : stats.instructors?.active || 0}
                        icon={<BookOpen size={24} />}
                        color="green"
                        subtitle={`${stats.instructors?.total || 0} total`}
                    />
                    <StatCard
                        title="Available Vehicles"
                        value={dashboardLoading ? '...' : stats.vehicles?.available || 0}
                        icon={<Car size={24} />}
                        color="purple"
                        subtitle={`${stats.vehicles?.total || 0} total vehicles`}
                    />
                    <StatCard
                        title="Total Revenue"
                        value={dashboardLoading ? '...' : `$${(stats.revenue?.total || 0).toLocaleString()}`}
                        icon={<DollarSign size={24} />}
                        color="yellow"
                        trend={stats.revenue?.trend}
                        subtitle={`$${(stats.revenue?.thisMonth || 0).toLocaleString()} this month`}
                    />
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Today's Lessons"
                        value={dashboardLoading ? '...' : stats.lessons?.today || 0}
                        icon={<Calendar size={24} />}
                        color="indigo"
                        subtitle="Scheduled for today"
                    />
                    <StatCard
                        title="Upcoming Lessons"
                        value={dashboardLoading ? '...' : stats.lessons?.upcoming || 0}
                        icon={<Clock size={24} />}
                        color="blue"
                        subtitle="Next 7 days"
                    />
                    <StatCard
                        title="Completed Lessons"
                        value={dashboardLoading ? '...' : stats.lessons?.completed || 0}
                        icon={<CheckCircle size={24} />}
                        color="green"
                        subtitle="Total completed"
                    />
                    <StatCard
                        title="Pending Payments"
                        value={dashboardLoading ? '...' : `$${(stats.revenue?.pending || 0).toLocaleString()}`}
                        icon={<DollarSign size={24} />}
                        color="red"
                        subtitle="Outstanding balance"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Left Column - Charts */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Lessons Chart */}
                        <SimpleBarChart
                            data={charts.lessons || []}
                            label="Lessons This Week"
                            color="blue"
                        />

                        {/* Distribution Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DistributionChart
                                title="Lessons by Type"
                                data={distributions.lessonsByType || []}
                            />
                            <DistributionChart
                                title="Lessons by Status"
                                data={distributions.lessonsByStatus || []}
                            />
                        </div>

                        {/* Payment Methods */}
                        <DistributionChart
                            title="Payment Methods"
                            data={distributions.paymentsByMethod || []}
                        />
                    </div>

                    {/* Right Column - Activities and Actions */}
                    <div className="space-y-6">
                        <QuickActions />
                        <UpcomingLessons 
                            lessons={upcomingLessons} 
                            loading={lessonsLoading}
                        />
                        <RecentActivities 
                            activities={activities} 
                            loading={activitiesLoading}
                        />
                    </div>
                </div>

                {/* Top Performers */}
                {topPerformers.instructors && topPerformers.instructors.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Instructors</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {topPerformers.instructors.map((instructor, index) => (
                                <div key={index} className="p-4 border border-gray-200 rounded-lg text-center hover:border-blue-300 transition-colors">
                                    <div className="text-2xl font-bold text-blue-600 mb-1">
                                        #{index + 1}
                                    </div>
                                    <div className="font-semibold text-gray-900 text-sm mb-1">
                                        {instructor.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {instructor.lessonCount} lessons
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error State */}
                {dashboardError && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                        <p className="text-yellow-800 text-sm">
                            Unable to load some dashboard data. Please refresh the page.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
