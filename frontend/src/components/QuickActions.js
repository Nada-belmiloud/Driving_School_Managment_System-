'use client';

import { useRouter } from 'next/navigation';
import { UserPlus, Calendar, Car, DollarSign } from 'lucide-react';

export default function QuickActions() {
    const router = useRouter();

    const actions = [
        {
            title: 'Add Student',
            description: 'Register a new student',
            icon: <UserPlus className="w-6 h-6" />,
            color: 'bg-blue-500 hover:bg-blue-600',
            onClick: () => router.push('/dashboard/admin/students')
        },
        {
            title: 'Schedule Lesson',
            description: 'Book a new lesson',
            icon: <Calendar className="w-6 h-6" />,
            color: 'bg-green-500 hover:bg-green-600',
            onClick: () => router.push('/dashboard/admin/lessons')
        },
        {
            title: 'Add Vehicle',
            description: 'Register a new vehicle',
            icon: <Car className="w-6 h-6" />,
            color: 'bg-purple-500 hover:bg-purple-600',
            onClick: () => router.push('/dashboard/admin/vehicles')
        },
        {
            title: 'Record Payment',
            description: 'Add a new payment',
            icon: <DollarSign className="w-6 h-6" />,
            color: 'bg-yellow-500 hover:bg-yellow-600',
            onClick: () => router.push('/dashboard/admin/payments')
        },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={action.onClick}
                        className={`${action.color} text-white p-4 rounded-lg transition-colors duration-200 text-left group`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                                {action.icon}
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-1">{action.title}</h4>
                                <p className="text-xs opacity-90">{action.description}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
