// backend/src/controllers/schedule.controller.js
import Schedule from "../models/schedule.model.js";
import Candidate from "../models/candidate.model.js";
import Instructor from "../models/instructor.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

// @desc    Get all scheduled lessons with pagination and filtering
// @route   GET /api/v1/schedule
// @access  Private
export const getSchedules = asyncHandler(async (req, res, next) => {
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

    // Filter by candidate
    if (req.query.candidateId) {
        query.candidateId = req.query.candidateId;
    }

    // Filter by instructor
    if (req.query.instructorId) {
        query.instructorId = req.query.instructorId;
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

    const schedules = await Schedule.find(query)
        .populate('candidateId', 'name email phone licenseType')
        .populate('instructorId', 'name email phone')
        .sort(req.query.sortBy || 'date time')
        .skip(skip)
        .limit(limit);

    const total = await Schedule.countDocuments(query);

    res.status(200).json({
        success: true,
        count: schedules.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: schedules
    });
});

// @desc    Get single schedule entry
// @route   GET /api/v1/schedule/:id
// @access  Private
export const getSchedule = asyncHandler(async (req, res, next) => {
    const schedule = await Schedule.findById(req.params.id)
        .populate('candidateId', 'name email phone licenseType progress')
        .populate('instructorId', 'name email phone');

    if (!schedule) {
        return next(new AppError('Schedule not found', 404));
    }

    res.status(200).json({
        success: true,
        data: schedule
    });
});

// @desc    Create schedule entry
// @route   POST /api/v1/schedule
// @access  Private
export const addSchedule = asyncHandler(async (req, res, next) => {
    const { candidateId, instructorId, date, time, lessonType } = req.body;

    // Validate candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
        return next(new AppError('Candidate not found', 404));
    }

    if (candidate.status === 'deleted') {
        return next(new AppError('Cannot schedule for deleted candidate', 400));
    }

    // Validate instructor exists
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
        return next(new AppError('Instructor not found', 404));
    }

    if (instructor.status === 'deleted') {
        return next(new AppError('Cannot schedule with deleted instructor', 400));
    }

    // Check for instructor scheduling conflict
    const existingSchedule = await Schedule.findOne({
        instructorId,
        date: new Date(date),
        time,
        status: 'scheduled'
    });

    if (existingSchedule) {
        return next(new AppError('Instructor already has a lesson scheduled at this time', 400));
    }

    // Check for candidate scheduling conflict - candidate can't have two sessions at the same time
    const existingCandidateSchedule = await Schedule.findOne({
        candidateId,
        date: new Date(date),
        time,
        status: 'scheduled'
    });

    if (existingCandidateSchedule) {
        return next(new AppError('Candidate already has a lesson scheduled at this time', 400));
    }

    // Check if candidate has reached the maximum sessions for this phase (10 sessions max, excluding cancelled)
    const existingSessionsForPhase = await Schedule.countDocuments({
        candidateId,
        lessonType,
        status: { $in: ['scheduled', 'completed'] }  // Don't count cancelled sessions
    });

    const MAX_SESSIONS_PER_PHASE = 10;
    if (existingSessionsForPhase >= MAX_SESSIONS_PER_PHASE) {
        return next(new AppError(`Candidate has already reached the maximum of ${MAX_SESSIONS_PER_PHASE} sessions for ${lessonType}. Cannot schedule more sessions for this phase.`, 400));
    }

    const schedule = await Schedule.create({
        candidateId,
        instructorId,
        date,
        time,
        lessonType
    });

    await schedule.populate([
        { path: 'candidateId', select: 'name email' },
        { path: 'instructorId', select: 'name email' }
    ]);

    res.status(201).json({
        success: true,
        data: schedule,
        message: 'Lesson scheduled successfully'
    });
});

// @desc    Update schedule entry
// @route   PUT /api/v1/schedule/:id
// @access  Private
export const updateSchedule = asyncHandler(async (req, res, next) => {
    let schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
        return next(new AppError('Schedule not found', 404));
    }

    // If updating time/date/instructor, check for conflicts
    if (req.body.date || req.body.time || req.body.instructorId) {
        const checkDate = req.body.date || schedule.date;
        const checkTime = req.body.time || schedule.time;
        const checkInstructor = req.body.instructorId || schedule.instructorId;

        const existingSchedule = await Schedule.findOne({
            _id: { $ne: req.params.id },
            instructorId: checkInstructor,
            date: new Date(checkDate),
            time: checkTime,
            status: 'scheduled'
        });

        if (existingSchedule) {
            return next(new AppError('Instructor schedule conflict detected', 400));
        }

        // Also check for candidate conflicts
        const existingCandidateSchedule = await Schedule.findOne({
            _id: { $ne: req.params.id },
            candidateId: schedule.candidateId,
            date: new Date(checkDate),
            time: checkTime,
            status: 'scheduled'
        });

        if (existingCandidateSchedule) {
            return next(new AppError('Candidate schedule conflict detected', 400));
        }
    }

    schedule = await Schedule.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    )
        .populate('candidateId', 'name email')
        .populate('instructorId', 'name email');

    res.status(200).json({
        success: true,
        data: schedule,
        message: 'Schedule updated successfully'
    });
});

// @desc    Cancel schedule (set status to cancelled)
// @route   DELETE /api/v1/schedule/:id
// @access  Private
export const cancelSchedule = asyncHandler(async (req, res, next) => {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
        return next(new AppError('Schedule not found', 404));
    }

    schedule.status = 'cancelled';
    await schedule.save();

    res.status(200).json({
        success: true,
        data: {},
        message: 'Lesson cancelled successfully'
    });
});

// @desc    Mark schedule as completed
// @route   PUT /api/v1/schedule/:id/complete
// @access  Private
export const completeSchedule = asyncHandler(async (req, res, next) => {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
        return next(new AppError('Schedule not found', 404));
    }

    if (schedule.status !== 'scheduled') {
        return next(new AppError('Only scheduled lessons can be marked as completed', 400));
    }

    schedule.status = 'completed';
    await schedule.save();

    // Update the candidate's phases.sessionsCompleted and sessionHistory
    const candidate = await Candidate.findById(schedule.candidateId);
    if (candidate) {
        // Initialize phases if not present
        if (!candidate.phases || candidate.phases.length === 0) {
            candidate.phases = [
                { phase: 'highway_code', status: 'not_started', sessionsCompleted: 0, sessionsPlan: 10, examPassed: false, examAttempts: 0 },
                { phase: 'parking', status: 'not_started', sessionsCompleted: 0, sessionsPlan: 10, examPassed: false, examAttempts: 0 },
                { phase: 'driving', status: 'not_started', sessionsCompleted: 0, sessionsPlan: 10, examPassed: false, examAttempts: 0 }
            ];
        }

        // Initialize sessionHistory if not present
        if (!candidate.sessionHistory) {
            candidate.sessionHistory = [];
        }

        // Find the phase that matches the lesson type
        const phaseIndex = candidate.phases.findIndex(p => p.phase === schedule.lessonType);

        if (phaseIndex !== -1) {
            // Increment sessionsCompleted for this phase
            candidate.phases[phaseIndex].sessionsCompleted += 1;

            // If this is the first session for this phase, mark it as in_progress
            if (candidate.phases[phaseIndex].status === 'not_started') {
                candidate.phases[phaseIndex].status = 'in_progress';
            }
        }

        // Add to session history
        candidate.sessionHistory.push({
            id: schedule._id.toString(),
            phase: schedule.lessonType,
            date: schedule.date.toISOString().split('T')[0],
            time: schedule.time,
            status: 'completed'
        });

        await candidate.save();
    }

    await schedule.populate([
        { path: 'candidateId', select: 'name email' },
        { path: 'instructorId', select: 'name email' }
    ]);

    res.status(200).json({
        success: true,
        data: schedule,
        message: 'Lesson marked as completed'
    });
});

// @desc    Get candidate's schedule
// @route   GET /api/v1/schedule/candidate/:candidateId
// @access  Private
export const getCandidateSchedule = asyncHandler(async (req, res, next) => {
    const candidate = await Candidate.findById(req.params.candidateId);

    if (!candidate) {
        return next(new AppError('Candidate not found', 404));
    }

    const schedules = await Schedule.find({ candidateId: req.params.candidateId })
        .populate('instructorId', 'name email phone')
        .sort('-date -time');

    res.status(200).json({
        success: true,
        count: schedules.length,
        data: schedules
    });
});

// @desc    Get instructor's schedule
// @route   GET /api/v1/schedule/instructor/:instructorId
// @access  Private
export const getInstructorSchedule = asyncHandler(async (req, res, next) => {
    const instructor = await Instructor.findById(req.params.instructorId);

    if (!instructor) {
        return next(new AppError('Instructor not found', 404));
    }

    let query = { instructorId: req.params.instructorId };

    // Filter by date range if provided
    if (req.query.startDate || req.query.endDate) {
        query.date = {};
        if (req.query.startDate) {
            query.date.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
            query.date.$lte = new Date(req.query.endDate);
        }
    }

    const schedules = await Schedule.find(query)
        .populate('candidateId', 'name email phone licenseType')
        .sort('date time');

    res.status(200).json({
        success: true,
        count: schedules.length,
        data: schedules
    });
});

// @desc    Get upcoming lessons
// @route   GET /api/v1/schedule/upcoming
// @access  Private
export const getUpcomingSchedules = asyncHandler(async (req, res, next) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const limit = parseInt(req.query.limit) || 10;

    const schedules = await Schedule.find({
        date: { $gte: today },
        status: 'scheduled'
    })
        .populate('candidateId', 'name email phone')
        .populate('instructorId', 'name email phone')
        .sort('date time')
        .limit(limit);

    res.status(200).json({
        success: true,
        count: schedules.length,
        data: schedules
    });
});

