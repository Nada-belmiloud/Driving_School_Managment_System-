'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon, color = 'blue', trend, subtitle }) {
    const colors = {
        blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            icon: 'bg-blue-100',
            border: 'border-blue-200'
        },
        green: {
            bg: 'bg-green-50',
            text: 'text-green-600',
            icon: 'bg-green-100',
            border: 'border-green-200'
        },
        yellow: {
            bg: 'bg-yellow-50',
            text: 'text-yellow-600',
            icon: 'bg-yellow-100',
            border: 'border-yellow-200'
        },
        red: {
            bg: 'bg-red-50',
            text: 'text-red-600',
            icon: 'bg-red-100',
            border: 'border-red-200'
        },
        purple: {
            bg: 'bg-purple-50',
            text: 'text-purple-600',
            icon: 'bg-purple-100',
            border: 'border-purple-200'
        },
        indigo: {
            bg: 'bg-indigo-50',
            text: 'text-indigo-600',
            icon: 'bg-indigo-100',
            border: 'border-indigo-200'
        },
    };

    const colorScheme = colors[color] || colors.blue;

    return (
        <div className={`bg-white rounded-xl shadow-sm border ${colorScheme.border} p-6 hover:shadow-md transition-shadow duration-200`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
                    
                    {subtitle && (
                        <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
                    )}
                    
                    {trend && (
                        <div className="flex items-center gap-1">
                            {trend.isPositive ? (
                                <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {trend.value}%
                            </span>
                            <span className="text-xs text-gray-500 ml-1">vs last month</span>
                        </div>
                    )}
                </div>
                
                <div className={`p-3 rounded-lg ${colorScheme.icon}`}>
                    <div className={colorScheme.text}>
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );
}
