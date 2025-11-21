'use client';

import { Calendar, DollarSign, Users, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function RecentActivities({ activities, loading }) {
    const getActivityIcon = (type, action) => {
        if (type === 'lesson') return <Calendar className="w-5 h-5" />;
        if (type === 'payment') return <DollarSign className="w-5 h-5" />;
        if (type === 'student') return <Users className="w-5 h-5" />;
        return <CheckCircle className="w-5 h-5" />;
    };

    const getActivityColor = (type, action) => {
        if (type === 'lesson') return 'bg-blue-100 text-blue-600';
        if (type === 'payment' && action === 'received') return 'bg-green-100 text-green-600';
        if (type === 'payment' && action === 'pending') return 'bg-yellow-100 text-yellow-600';
        if (type === 'student') return 'bg-purple-100 text-purple-600';
        return 'bg-gray-100 text-gray-600';
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return d.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-start gap-3 animate-pulse">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!activities || activities.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No recent activities</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {activities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className={`p-2 rounded-lg ${getActivityColor(activity.type, activity.action)}`}>
                            {getActivityIcon(activity.type, activity.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 font-medium mb-1">
                                {activity.description}
                            </p>
                            <p className="text-xs text-gray-500">
                                {formatDate(activity.date)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
