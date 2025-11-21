'use client';

import { Calendar, Clock, User, Car, MapPin } from 'lucide-react';

export default function UpcomingLessons({ lessons, loading }) {
    const formatDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            weekday: 'short'
        });
    };

    const getLessonTypeColor = (type) => {
        const colors = {
            theory: 'bg-blue-100 text-blue-800',
            practical: 'bg-green-100 text-green-800',
            'test-preparation': 'bg-purple-100 text-purple-800',
            exam: 'bg-red-100 text-red-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Lessons</h3>
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!lessons || lessons.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Lessons</h3>
                <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No upcoming lessons</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Lessons</h3>
                <span className="text-xs text-gray-500">{lessons.length} scheduled</span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {lessons.map((lesson, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-900">
                                    {formatDate(lesson.date)}
                                </span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getLessonTypeColor(lesson.lessonType)}`}>
                                {lesson.lessonType}
                            </span>
                        </div>
                        
                        <div className="space-y-1.5 ml-6">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{lesson.time}</span>
                            </div>
                            {lesson.studentId && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <User className="w-3.5 h-3.5" />
                                    <span>{lesson.studentId.name}</span>
                                </div>
                            )}
                            {lesson.instructorId && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <User className="w-3.5 h-3.5" />
                                    <span className="text-xs">Instructor: {lesson.instructorId.name}</span>
                                </div>
                            )}
                            {lesson.vehicleId && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Car className="w-3.5 h-3.5" />
                                    <span className="text-xs">{lesson.vehicleId.plateNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
