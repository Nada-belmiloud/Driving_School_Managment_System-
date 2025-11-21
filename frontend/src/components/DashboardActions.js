'use client';

import { FileDown, Printer } from 'lucide-react';

export default function DashboardActions({ onExport, onPrint }) {
    const handleExportCSV = () => {
        if (onExport) {
            onExport('csv');
        }
    };

    const handleExportPDF = () => {
        if (onExport) {
            onExport('pdf');
        }
    };

    const handlePrint = () => {
        if (onPrint) {
            onPrint();
        } else {
            window.print();
        }
    };

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Print Dashboard"
            >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print</span>
            </button>
            
            <div className="relative group">
                <button
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    title="Export Dashboard"
                >
                    <FileDown className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                </button>
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="py-1">
                        <button
                            onClick={handleExportCSV}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            Export as CSV
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            Export as PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
