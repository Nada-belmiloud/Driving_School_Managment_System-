'use client';

export default function DistributionChart({ title, data, type = 'doughnut' }) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
                <div className="text-center py-8 text-gray-500">
                    No data available
                </div>
            </div>
        );
    }

    const colors = [
        { bg: 'bg-blue-500', text: 'text-blue-500' },
        { bg: 'bg-green-500', text: 'text-green-500' },
        { bg: 'bg-purple-500', text: 'text-purple-500' },
        { bg: 'bg-yellow-500', text: 'text-yellow-500' },
        { bg: 'bg-red-500', text: 'text-red-500' },
        { bg: 'bg-indigo-500', text: 'text-indigo-500' },
        { bg: 'bg-pink-500', text: 'text-pink-500' },
        { bg: 'bg-orange-500', text: 'text-orange-500' },
    ];

    const total = data.reduce((sum, item) => sum + (item.count || item.amount || 0), 0);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            
            <div className="space-y-4">
                {/* Visual representation */}
                <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-gray-100">
                    {data.map((item, index) => {
                        const value = item.count || item.amount || 0;
                        const percentage = total > 0 ? (value / total) * 100 : 0;
                        const color = colors[index % colors.length];
                        
                        if (percentage < 1) return null;
                        
                        return (
                            <div
                                key={index}
                                className={`${color.bg} transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                                title={`${item._id}: ${percentage.toFixed(1)}%`}
                            ></div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="space-y-2">
                    {data.map((item, index) => {
                        const value = item.count || item.amount || 0;
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        const color = colors[index % colors.length];
                        const label = item._id || `Item ${index + 1}`;
                        
                        return (
                            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${color.bg}`}></div>
                                    <span className="text-sm text-gray-700 capitalize">
                                        {label.replace(/-/g, ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {value.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-500 w-12 text-right">
                                        {percentage}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Total */}
                <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Total</span>
                        <span className="text-lg font-bold text-gray-900">
                            {total.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
