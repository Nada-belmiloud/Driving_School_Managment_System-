// backend/src/controllers/dashboard.controller.js
import Student from "../models/student.model.js";
import Instructor from "../models/instructor.model.js";
import Vehicle from "../models/vehicle.model.js";
import Lesson from "../models/lesson.model.js";
import Payment from "../models/payment.model.js";
import { asyncHandler } from "../middleware/error.middleware.js";

// @desc    Get comprehensive dashboard statistics
// @route   GET /api/v1/dashboard/stats
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res, next) => {
    try {
        // Get current date ranges
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        // Parallel fetch all statistics
        const [
            // Student stats
            totalStudents,
            activeStudents,
            studentsLastMonth,
            
            // Instructor stats
            totalInstructors,
            activeInstructors,
            
            // Vehicle stats
            totalVehicles,
            availableVehicles,
            maintenanceVehicles,
            
            // Lesson stats
            totalLessons,
            todayLessons,
            upcomingLessons,
            completedLessons,
            scheduledLessons,
            
            // Payment stats
            totalRevenue,
            pendingPayments,
            monthlyRevenue,
            
            // Recent data
            recentStudents,
            recentLessons,
            recentPayments
        ] = await Promise.all([
            // Student queries
            Student.countDocuments(),
            Student.countDocuments({ 'progress.status': { $ne: 'graduated' } }),
            Student.countDocuments({ registrationDate: { $gte: lastMonth } }),
            
            // Instructor queries
            Instructor.countDocuments(),
            Instructor.countDocuments({ status: 'active' }),
            
            // Vehicle queries
            Vehicle.countDocuments(),
            Vehicle.countDocuments({ status: 'available' }),
            Vehicle.countDocuments({ status: 'maintenance' }),
            
            // Lesson queries
            Lesson.countDocuments(),
            Lesson.countDocuments({
                date: { $gte: today, $lt: tomorrow },
                status: { $in: ['scheduled', 'in-progress'] }
            }),
            Lesson.countDocuments({
                date: { $gte: today, $lte: nextWeek },
                status: 'scheduled'
            }),
            Lesson.countDocuments({ status: 'completed' }),
            Lesson.countDocuments({ status: 'scheduled' }),
            
            // Payment queries
            Payment.aggregate([
                { $match: { status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Payment.aggregate([
                { $match: { status: 'pending' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Payment.aggregate([
                { 
                    $match: { 
                        status: 'paid',
                        date: { $gte: lastMonth }
                    } 
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            
            // Recent data
            Student.find().sort('-registrationDate').limit(5).select('name email registrationDate licenseType'),
            Lesson.find({ date: { $gte: today } })
                .populate('studentId', 'name')
                .populate('instructorId', 'name')
                .populate('vehicleId', 'plateNumber')
                .sort({ date: 1, time: 1 })
                .limit(5),
            Payment.find()
                .populate('studentId', 'name')
                .sort('-date')
                .limit(5)
        ]);

        // Calculate trends (comparing with last month)
        const studentsLastMonthStart = new Date(lastMonth);
        studentsLastMonthStart.setMonth(studentsLastMonthStart.getMonth() - 1);
        
        const [
            studentsLastMonthBefore,
            lessonsLastMonth,
            lessonsLastMonthBefore,
            revenueLastMonth
        ] = await Promise.all([
            Student.countDocuments({ 
                registrationDate: { 
                    $gte: studentsLastMonthStart,
                    $lt: lastMonth 
                } 
            }),
            Lesson.countDocuments({
                date: { $gte: lastMonth },
                status: 'completed'
            }),
            Lesson.countDocuments({
                date: { 
                    $gte: studentsLastMonthStart,
                    $lt: lastMonth 
                },
                status: 'completed'
            }),
            Payment.aggregate([
                { 
                    $match: { 
                        status: 'paid',
                        date: { 
                            $gte: studentsLastMonthStart,
                            $lt: lastMonth 
                        }
                    } 
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        ]);

        // Calculate percentage changes
        const calculateTrend = (current, previous) => {
            if (previous === 0) return { value: 0, isPositive: current > 0 };
            const change = ((current - previous) / previous) * 100;
            return {
                value: Math.abs(change).toFixed(1),
                isPositive: change >= 0
            };
        };

        const studentTrend = calculateTrend(studentsLastMonth, studentsLastMonthBefore);
        const lessonTrend = calculateTrend(lessonsLastMonth, lessonsLastMonthBefore);
        const revenueTrend = calculateTrend(
            monthlyRevenue[0]?.total || 0,
            revenueLastMonth[0]?.total || 0
        );

        // Get lesson type distribution
        const lessonsByType = await Lesson.aggregate([
            {
                $group: {
                    _id: '$lessonType',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get lesson status distribution
        const lessonsByStatus = await Lesson.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get top instructors by completed lessons
        const topInstructors = await Lesson.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: '$instructorId', lessonCount: { $sum: 1 } } },
            { $sort: { lessonCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'instructors',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'instructor'
                }
            },
            { $unwind: '$instructor' },
            {
                $project: {
                    _id: 1,
                    name: '$instructor.name',
                    email: '$instructor.email',
                    lessonCount: 1
                }
            }
        ]);

        // Get payment method distribution
        const paymentsByMethod = await Payment.aggregate([
            { $match: { status: 'paid' } },
            {
                $group: {
                    _id: '$method',
                    count: { $sum: 1 },
                    amount: { $sum: '$amount' }
                }
            }
        ]);

        // Response data
        res.status(200).json({
            success: true,
            data: {
                overview: {
                    students: {
                        total: totalStudents,
                        active: activeStudents,
                        newThisMonth: studentsLastMonth,
                        trend: studentTrend
                    },
                    instructors: {
                        total: totalInstructors,
                        active: activeInstructors
                    },
                    vehicles: {
                        total: totalVehicles,
                        available: availableVehicles,
                        inMaintenance: maintenanceVehicles
                    },
                    lessons: {
                        total: totalLessons,
                        today: todayLessons,
                        upcoming: upcomingLessons,
                        completed: completedLessons,
                        scheduled: scheduledLessons,
                        trend: lessonTrend
                    },
                    revenue: {
                        total: totalRevenue[0]?.total || 0,
                        pending: pendingPayments[0]?.total || 0,
                        thisMonth: monthlyRevenue[0]?.total || 0,
                        trend: revenueTrend
                    }
                },
                distributions: {
                    lessonsByType,
                    lessonsByStatus,
                    paymentsByMethod
                },
                topPerformers: {
                    instructors: topInstructors
                },
                recent: {
                    students: recentStudents,
                    lessons: recentLessons,
                    payments: recentPayments
                }
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(200).json({
            success: true,
            data: {
                overview: {
                    students: { total: 0, active: 0, newThisMonth: 0, trend: { value: 0, isPositive: true } },
                    instructors: { total: 0, active: 0 },
                    vehicles: { total: 0, available: 0, inMaintenance: 0 },
                    lessons: { total: 0, today: 0, upcoming: 0, completed: 0, scheduled: 0, trend: { value: 0, isPositive: true } },
                    revenue: { total: 0, pending: 0, thisMonth: 0, trend: { value: 0, isPositive: true } }
                },
                distributions: {
                    lessonsByType: [],
                    lessonsByStatus: [],
                    paymentsByMethod: []
                },
                topPerformers: {
                    instructors: []
                },
                recent: {
                    students: [],
                    lessons: [],
                    payments: []
                }
            }
        });
    }
});


