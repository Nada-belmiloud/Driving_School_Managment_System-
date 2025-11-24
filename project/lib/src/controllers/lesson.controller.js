import Lesson from "../models/lesson.model.js";
import Student from "../models/student.model.js";
import Instructor from "../models/instructor.model.js";
import Vehicle from "../models/vehicle.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

// Helper function to normalize time to HH:MM string format
const normalizeTime = (time) => {
    if (!time) return null;
    
    if (typeof time === 'string') {
        return time;
    } else if (time instanceof Date) {
        // If time is a Date object, extract HH:MM format
        const hours = String(time.getHours()).padStart(2, '0');
        const minutes = String(time.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    } else if (Array.isArray(time) && time.length >= 1) {
        // If time is an array like ["10:00", "12:00"], use the first element
        return String(time[0]);
    } else {
        // Fallback: convert to string
        return String(time);
    }
};

// @desc    Get single lesson
// @route   GET /api/lessons/:id
// @access  Private
export const getLesson = asyncHandler(async (req, res, next) => {
    const lesson = await Lesson.findById(req.params.id)
        .populate('studentId', 'name email phone licenseType')
        .populate('instructorId', 'name email experienceYears')
        .populate('vehicleId', 'plateNumber model year');

    if (!lesson) {
        return next(new AppError('Lesson not found', 404));
    }

    res.status(200).json({
        success: true,
        data: lesson
    });
});

// Helper function to check conflicts
const checkConflicts = async (instructorId, vehicleId, date, time, excludeLessonId = null) => {
    // Defensive validation to ensure proper types
    if (!date || !time) {
        return [];
    }
    
    // Normalize time to HH:MM string format
    const timeStr = normalizeTime(time);
    
    // Validate time format
    if (!timeStr || !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
        return [];
    }
    
    const query = {
        date: new Date(date),
        time: timeStr,
        status: { $in: ['scheduled', 'in-progress'] },
        $or: [
            { instructorId },
            { vehicleId }
        ]
    };

    // Exclude current lesson when updating
    if (excludeLessonId) {
        query._id = { $ne: excludeLessonId };
    }

    const conflicts = await Lesson.find(query)
        .populate('instructorId', 'name')
        .populate('vehicleId', 'plateNumber');

    return conflicts;
};

// @desc    Schedule new lesson
// @route   POST /api/lessons
// @access  Private
export const addLesson = asyncHandler(async (req, res, next) => {
    const { studentId, instructorId, vehicleId, date, time } = req.body;

    // Defensive normalization: ensure time is a string in HH:MM format
    const normalizedTime = normalizeTime(time);
    
    if (!normalizedTime) {
        return next(new AppError('Time is required in HH:MM format', 400));
    }
    
    if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(normalizedTime)) {
        return next(new AppError('Time must be in HH:MM format', 400));
    }

    // Validate that all entities exist
    const student = await Student.findById(studentId);
    if (!student) {
        return next(new AppError('Student not found', 404));
    }

    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
        return next(new AppError('Instructor not found', 404));
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    // Check vehicle availability
    if (vehicle.status !== 'available') {
        return next(new AppError(`Vehicle is ${vehicle.status}`, 400));
    }

    // Check for scheduling conflicts with normalized time
    const conflicts = await checkConflicts(instructorId, vehicleId, date, normalizedTime);

    if (conflicts.length > 0) {
        const conflictMessages = conflicts.map(c => {
            if (c.instructorId._id.toString() === instructorId) {
                return `Instructor ${c.instructorId.name} is already scheduled at this time`;
            }
            if (c.vehicleId._id.toString() === vehicleId) {
                return `Vehicle ${c.vehicleId.plateNumber} is already scheduled at this time`;
            }
        });

        return next(new AppError(conflictMessages.join('. '), 400));
    }

    // Create lesson with normalized time
    const lessonData = { ...req.body, time: normalizedTime };
    const lesson = await Lesson.create(lessonData);

    // Populate before returning
    await lesson.populate([
        { path: 'studentId', select: 'name email' },
        { path: 'instructorId', select: 'name email' },
        { path: 'vehicleId', select: 'plateNumber model' }
    ]);

    res.status(201).json({
        success: true,
        data: lesson,
        message: 'Lesson scheduled successfully'
    });
});

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private
export const updateLesson = asyncHandler(async (req, res, next) => {
    let lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
        return next(new AppError('Lesson not found', 404));
    }

    // Defensive normalization: ensure time is a string if provided
    if (req.body.time) {
        const normalizedTime = normalizeTime(req.body.time);
        
        if (!normalizedTime) {
            return next(new AppError('Invalid time format', 400));
        }
        
        if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(normalizedTime)) {
            return next(new AppError('Time must be in HH:MM format', 400));
        }
        
        // Replace time with normalized version
        req.body.time = normalizedTime;
    }

    // If updating time/date/instructor/vehicle, check for conflicts
    if (req.body.date || req.body.time || req.body.instructorId || req.body.vehicleId) {
        const checkDate = req.body.date || lesson.date;
        const checkTime = req.body.time || lesson.time;
        const checkInstructor = req.body.instructorId || lesson.instructorId;
        const checkVehicle = req.body.vehicleId || lesson.vehicleId;

        const conflicts = await checkConflicts(
            checkInstructor,
            checkVehicle,
            checkDate,
            checkTime,
            req.params.id
        );

        if (conflicts.length > 0) {
            return next(new AppError('Schedule conflict detected', 400));
        }
    }

    lesson = await Lesson.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    )
        .populate('studentId', 'name email')
        .populate('instructorId', 'name email')
        .populate('vehicleId', 'plateNumber model');

    res.status(200).json({
        success: true,
        data: lesson,
        message: 'Lesson updated successfully'
    });
});

// @desc    Cancel/Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private
export const deleteLesson = asyncHandler(async (req, res, next) => {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
        return next(new AppError('Lesson not found', 404));
    }

    // Instead of deleting, update status to cancelled
    lesson.status = 'cancelled';
    await lesson.save();

    res.status(200).json({
        success: true,
        data: {},
        message: 'Lesson cancelled successfully'
    });
});

// @desc    Get lessons with advanced filtering
// @route   GET /api/lessons
// @access  Private

// @desc    Get lessons with advanced filtering
// @route   GET /api/lessons
// @access  Private
export const getLessons = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by status
    if (req.query.status) {
        query.status = req.query.status;
    }

    // Filter by lesson type
    if (req.query.lessonType) {
        query.lessonType = req.query.lessonType;
    }

    // Filter by student
    if (req.query.studentId) {
        query.studentId = req.query.studentId;
    }

    // Filter by instructor
    if (req.query.instructorId) {
        query.instructorId = req.query.instructorId;
    }

    // Filter by vehicle
    if (req.query.vehicleId) {
        query.vehicleId = req.query.vehicleId;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
        query.date = {};
        if (req.query.startDate) {
            query.date.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
            query.date.$lte = new Date(req.query.endDate);
        }
    }

    // Search functionality - simpler approach without filtering after population
    if (req.query.search) {
        // If there's a search term, we need to search across related collections
        const searchRegex = new RegExp(req.query.search, 'i');

        // Find matching students, instructors, and vehicles
        const [students, instructors, vehicles] = await Promise.all([
            Student.find({
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                    { phone: searchRegex }
                ]
            }).select('_id'),
            Instructor.find({
                $or: [
                    { name: searchRegex },
                    { email: searchRegex }
                ]
            }).select('_id'),
            Vehicle.find({
                $or: [
                    { plateNumber: searchRegex },
                    { model: searchRegex }
                ]
            }).select('_id')
        ]);

        const studentIds = students.map(s => s._id);
        const instructorIds = instructors.map(i => i._id);
        const vehicleIds = vehicles.map(v => v._id);

        // Add search criteria to query
        if (studentIds.length > 0 || instructorIds.length > 0 || vehicleIds.length > 0) {
            query.$or = [];
            if (studentIds.length > 0) {
                query.$or.push({ studentId: { $in: studentIds } });
            }
            if (instructorIds.length > 0) {
                query.$or.push({ instructorId: { $in: instructorIds } });
            }
            if (vehicleIds.length > 0) {
                query.$or.push({ vehicleId: { $in: vehicleIds } });
            }
        } else {
            // No matches found, return empty result
            return res.status(200).json({
                success: true,
                count: 0,
                pagination: {
                    page,
                    limit,
                    total: 0,
                    pages: 0
                },
                data: []
            });
        }
    }

    // Execute query with population
    const lessons = await Lesson.find(query)
        .populate('studentId', 'name email phone licenseType')
        .populate('instructorId', 'name email experienceYears phone')
        .populate('vehicleId', 'plateNumber model year transmission fuelType')
        .sort(req.query.sortBy || { date: 1, time: 1 })
        .skip(skip)
        .limit(limit);

    const total = await Lesson.countDocuments(query);

    res.status(200).json({
        success: true,
        count: lessons.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: lessons
    });
});

