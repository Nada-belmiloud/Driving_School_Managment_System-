'use client';

export default function SimpleBarChart({ data, label, color = 'blue' }) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{label}</h3>
                <div className="text-center py-12 text-gray-500">
                    No data available
                </div>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.count || d.total || 0));
    
    const colors = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
    };

    const barColor = colors[color] || colors.blue;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{label}</h3>
            <div className="space-y-4">
                {data.slice(0, 7).map((item, index) => {
                    const value = item.count || item.total || 0;
                    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                    const dateLabel = item._id ? new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Item ${index + 1}`;
                    
                    return (
                        <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 font-medium">{dateLabel}</span>
                                <span className="text-gray-900 font-semibold">{value}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className={`${barColor} h-2.5 rounded-full transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
