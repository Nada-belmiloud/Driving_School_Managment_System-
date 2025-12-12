// backend/src/controllers/dashboard.controller.js
import Candidate from "../models/candidate.model.js";
import Instructor from "../models/instructor.model.js";
import Vehicle from "../models/vehicle.model.js";
import { asyncHandler } from "../middleware/error.middleware.js";

// @desc    Get dashboard statistics
// @route   GET /api/v1/dashboard/stats
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res, next) => {
    // Get counts in parallel
    const [
        totalCandidates,
        totalInstructors,
        totalVehicles,
        pendingPaymentsData
    ] = await Promise.all([
        // Total candidates (excluding deleted)
        Candidate.countDocuments({ status: { $ne: 'deleted' } }),

        // Total instructors (excluding deleted)
        Instructor.countDocuments({ status: { $ne: 'deleted' } }),

        // Total vehicles (excluding retired)
        Vehicle.countDocuments({ status: { $ne: 'retired' } }),

        // Calculate pending payments from candidates with remaining balance
        Candidate.aggregate([
            { $match: { status: { $ne: 'deleted' } } },
            {
                $project: {
                    totalFee: { $ifNull: ['$totalFee', 34000] },
                    paidAmount: { $ifNull: ['$paidAmount', 0] }
                }
            },
            {
                $project: {
                    remainingAmount: { $subtract: ['$totalFee', '$paidAmount'] }
                }
            },
            { $match: { remainingAmount: { $gt: 0 } } },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$remainingAmount' }
                }
            }
        ])
    ]);

    const pendingPayments = pendingPaymentsData[0] || { count: 0, totalAmount: 0 };

    res.status(200).json({
        success: true,
        data: {
            totalCandidates,
            totalInstructors,
            totalVehicles,
            pendingPayments: {
                count: pendingPayments.count,
                totalAmount: pendingPayments.totalAmount
            }
        }
    });
});

