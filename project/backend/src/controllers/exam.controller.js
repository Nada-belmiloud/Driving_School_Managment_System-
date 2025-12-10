// backend/src/controllers/exam.controller.js
import Exam from "../models/exam.model.js";
import Candidate from "../models/candidate.model.js";
import Instructor from "../models/instructor.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

// @desc    Get all exams with pagination and filtering
// @route   GET /api/v1/exams
// @access  Private
export const getExams = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by status
    if (req.query.status) {
        query.status = req.query.status;
    }

    // Filter by exam type
    if (req.query.examType) {
        query.examType = req.query.examType;
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

    const exams = await Exam.find(query)
        .populate('candidateId', 'name email phone licenseType progress')
        .populate('instructorId', 'name email phone')
        .sort(req.query.sortBy || '-date')
        .skip(skip)
        .limit(limit);

    const total = await Exam.countDocuments(query);

    res.status(200).json({
        success: true,
        count: exams.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: exams
    });
});

// @desc    Get single exam
// @route   GET /api/v1/exams/:id
// @access  Private
export const getExam = asyncHandler(async (req, res, next) => {
    const exam = await Exam.findById(req.params.id)
        .populate('candidateId', 'name email phone licenseType progress')
        .populate('instructorId', 'name email phone');

    if (!exam) {
        return next(new AppError('Exam not found', 404));
    }

    res.status(200).json({
        success: true,
        data: exam
    });
});

// @desc    Schedule a new exam
// @route   POST /api/v1/exams
// @access  Private
export const scheduleExam = asyncHandler(async (req, res, next) => {
    const { candidateId, instructorId, examType, date, time, notes } = req.body;

    // Validate candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
        return next(new AppError('Candidate not found', 404));
    }

    if (candidate.status === 'deleted') {
        return next(new AppError('Cannot schedule exam for deleted candidate', 400));
    }

    // Validate instructor exists
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
        return next(new AppError('Instructor not found', 404));
    }

    if (instructor.status === 'deleted') {
        return next(new AppError('Cannot schedule exam with deleted instructor', 400));
    }

    // Check 15-day waiting rule
    const canTakeResult = await Exam.canTakeExam(candidateId, examType);
    if (!canTakeResult.canTake) {
        return next(new AppError(canTakeResult.reason, 400));
    }

    // Check if candidate already has a scheduled exam for this type
    const existingScheduledExam = await Exam.findOne({
        candidateId,
        examType,
        status: 'scheduled'
    });

    if (existingScheduledExam) {
        return next(new AppError(`Candidate already has a scheduled ${examType} exam`, 400));
    }

    // Check if candidate has already passed this exam type
    const hasPassed = await Exam.hasPassedExam(candidateId, examType);
    if (hasPassed) {
        return next(new AppError(`Candidate has already passed the ${examType} exam`, 400));
    }

    // Check for instructor scheduling conflict
    const existingExam = await Exam.findOne({
        instructorId,
        date: new Date(date),
        time,
        status: 'scheduled'
    });

    if (existingExam) {
        return next(new AppError('Instructor already has an exam scheduled at this time', 400));
    }

    // Get attempt number
    const attemptNumber = await Exam.getNextAttemptNumber(candidateId, examType);

    const exam = await Exam.create({
        candidateId,
        instructorId,
        examType,
        date,
        time,
        attemptNumber,
        notes
    });

    await exam.populate([
        { path: 'candidateId', select: 'name email licenseType progress' },
        { path: 'instructorId', select: 'name email' }
    ]);

    res.status(201).json({
        success: true,
        data: exam,
        message: 'Exam scheduled successfully'
    });
});

// @desc    Update exam
// @route   PUT /api/v1/exams/:id
// @access  Private
export const updateExam = asyncHandler(async (req, res, next) => {
    let exam = await Exam.findById(req.params.id);

    if (!exam) {
        return next(new AppError('Exam not found', 404));
    }

    // If updating date/time/instructor, check for conflicts
    if (req.body.date || req.body.time || req.body.instructorId) {
        const checkDate = req.body.date || exam.date;
        const checkTime = req.body.time || exam.time;
        const checkInstructor = req.body.instructorId || exam.instructorId;

        const existingExam = await Exam.findOne({
            _id: { $ne: req.params.id },
            instructorId: checkInstructor,
            date: new Date(checkDate),
            time: checkTime,
            status: 'scheduled'
        });

        if (existingExam) {
            return next(new AppError('Schedule conflict detected', 400));
        }
    }

    exam = await Exam.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    )
        .populate('candidateId', 'name email licenseType progress')
        .populate('instructorId', 'name email');

    res.status(200).json({
        success: true,
        data: exam,
        message: 'Exam updated successfully'
    });
});

// @desc    Record exam result (pass/fail)
// @route   PUT /api/v1/exams/:id/result
// @access  Private
export const recordExamResult = asyncHandler(async (req, res, next) => {
    const { result, notes } = req.body;

    if (!result || !['passed', 'failed'].includes(result)) {
        return next(new AppError('Result must be either "passed" or "failed"', 400));
    }

    const exam = await Exam.findById(req.params.id);

    if (!exam) {
        return next(new AppError('Exam not found', 404));
    }

    if (exam.status !== 'scheduled') {
        return next(new AppError('Only scheduled exams can have results recorded', 400));
    }

    exam.status = result;
    if (notes) {
        exam.notes = notes;
    }
    await exam.save();

    // If passed, update candidate progress to next phase
    if (result === 'passed') {
        const candidate = await Candidate.findById(exam.candidateId);
        if (candidate) {
            const progressOrder = ['highway_code', 'parking', 'driving'];
            const currentIndex = progressOrder.indexOf(exam.examType);

            // If this is the last phase (driving), mark candidate as completed
            if (currentIndex === progressOrder.length - 1) {
                candidate.status = 'completed';
            } else if (currentIndex < progressOrder.length - 1) {
                // Move to next phase
                candidate.progress = progressOrder[currentIndex + 1];
            }

            await candidate.save();
        }
    }

    await exam.populate([
        { path: 'candidateId', select: 'name email licenseType progress status' },
        { path: 'instructorId', select: 'name email' }
    ]);

    res.status(200).json({
        success: true,
        data: exam,
        message: `Exam marked as ${result}`
    });
});

// @desc    Cancel exam
// @route   DELETE /api/v1/exams/:id
// @access  Private
export const cancelExam = asyncHandler(async (req, res, next) => {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
        return next(new AppError('Exam not found', 404));
    }

    if (exam.status !== 'scheduled') {
        return next(new AppError('Only scheduled exams can be cancelled', 400));
    }

    exam.status = 'cancelled';
    await exam.save();

    res.status(200).json({
        success: true,
        data: {},
        message: 'Exam cancelled successfully'
    });
});

// @desc    Check if candidate can take exam (15-day rule)
// @route   GET /api/v1/exams/can-take/:candidateId/:examType
// @access  Private
export const checkCanTakeExam = asyncHandler(async (req, res, next) => {
    const { candidateId, examType } = req.params;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
        return next(new AppError('Candidate not found', 404));
    }

    const result = await Exam.canTakeExam(candidateId, examType);

    res.status(200).json({
        success: true,
        data: result
    });
});

// @desc    Get candidate's exam history
// @route   GET /api/v1/exams/candidate/:candidateId
// @access  Private
export const getCandidateExams = asyncHandler(async (req, res, next) => {
    const candidate = await Candidate.findById(req.params.candidateId);

    if (!candidate) {
        return next(new AppError('Candidate not found', 404));
    }

    const exams = await Exam.getExamHistory(req.params.candidateId);

    // Group by exam type for easier display
    const examsByType = {
        highway_code: exams.filter(e => e.examType === 'highway_code'),
        parking: exams.filter(e => e.examType === 'parking'),
        driving: exams.filter(e => e.examType === 'driving')
    };

    // Get summary
    const summary = {
        highway_code: {
            attempts: examsByType.highway_code.filter(e => ['passed', 'failed'].includes(e.status)).length,
            passed: examsByType.highway_code.some(e => e.status === 'passed')
        },
        parking: {
            attempts: examsByType.parking.filter(e => ['passed', 'failed'].includes(e.status)).length,
            passed: examsByType.parking.some(e => e.status === 'passed')
        },
        driving: {
            attempts: examsByType.driving.filter(e => ['passed', 'failed'].includes(e.status)).length,
            passed: examsByType.driving.some(e => e.status === 'passed')
        }
    };

    res.status(200).json({
        success: true,
        count: exams.length,
        data: {
            exams,
            examsByType,
            summary
        }
    });
});

// @desc    Get upcoming exams
// @route   GET /api/v1/exams/upcoming
// @access  Private
export const getUpcomingExams = asyncHandler(async (req, res, next) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const limit = parseInt(req.query.limit) || 10;

    const exams = await Exam.find({
        date: { $gte: today },
        status: 'scheduled'
    })
        .populate('candidateId', 'name email phone licenseType')
        .populate('instructorId', 'name email phone')
        .sort('date time')
        .limit(limit);

    res.status(200).json({
        success: true,
        count: exams.length,
        data: exams
    });
});

