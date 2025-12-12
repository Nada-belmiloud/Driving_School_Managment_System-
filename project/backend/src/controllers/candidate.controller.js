// backend/src/controllers/candidate.controller.js
import Candidate from "../models/candidate.model.js";
import Schedule from "../models/schedule.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

// @desc    Get all candidates with pagination and filtering
// @route   GET /api/v1/candidates
// @access  Private
export const getCandidates = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by license type
    if (req.query.licenseType) {
        query.licenseType = req.query.licenseType;
    }

    // Filter by status (exclude deleted by default)
    if (req.query.status) {
        query.status = req.query.status;
    } else {
        query.status = { $ne: 'deleted' };
    }

    // Filter by progress
    if (req.query.progress) {
        query.progress = req.query.progress;
    }

    // Search by name, email, or phone
    if (req.query.search) {
        query.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
            { phone: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    const candidates = await Candidate.find(query)
        .sort(req.query.sortBy || '-registrationDate')
        .skip(skip)
        .limit(limit);

    const total = await Candidate.countDocuments(query);

    res.status(200).json({
        success: true,
        count: candidates.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: candidates
    });
});

// @desc    Get single candidate by ID
// @route   GET /api/v1/candidates/:id
// @access  Private
export const getCandidate = asyncHandler(async (req, res, next) => {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
        return next(new AppError('Candidate not found', 404));
    }

    // Sync completed sessions from Schedule collection
    const completedSessions = await Schedule.find({
        candidateId: req.params.id,
        status: 'completed'
    });

    // Initialize phases if not present
    if (!candidate.phases || candidate.phases.length === 0) {
        candidate.phases = [
            { phase: 'highway_code', status: 'not_started', sessionsCompleted: 0, sessionsPlan: 10, examPassed: false, examAttempts: 0 },
            { phase: 'parking', status: 'not_started', sessionsCompleted: 0, sessionsPlan: 10, examPassed: false, examAttempts: 0 },
            { phase: 'driving', status: 'not_started', sessionsCompleted: 0, sessionsPlan: 10, examPassed: false, examAttempts: 0 }
        ];
    }

    // Count completed sessions per phase from Schedule collection
    const sessionCounts = {
        highway_code: 0,
        parking: 0,
        driving: 0
    };

    completedSessions.forEach(session => {
        if (session.lessonType && sessionCounts.hasOwnProperty(session.lessonType)) {
            sessionCounts[session.lessonType]++;
        }
    });

    // Update phases with actual completed session counts
    let needsSave = false;
    candidate.phases.forEach(phase => {
        const actualCount = sessionCounts[phase.phase] || 0;
        // Cap sessions at sessionsPlan (default 10)
        const cappedCount = Math.min(actualCount, phase.sessionsPlan || 10);

        if (phase.sessionsCompleted !== cappedCount) {
            phase.sessionsCompleted = cappedCount;
            needsSave = true;
        }

        // Update status based on sessions completed
        if (cappedCount >= (phase.sessionsPlan || 10) && phase.status !== 'completed' && !phase.examPassed) {
            // All sessions completed, mark phase as completed (ready for exam)
            phase.status = 'completed';
            needsSave = true;
        } else if (cappedCount > 0 && phase.status === 'not_started') {
            // Some sessions completed, mark as in_progress
            phase.status = 'in_progress';
            needsSave = true;
        }
    });

    // Initialize sessionHistory if not present
    if (!candidate.sessionHistory) {
        candidate.sessionHistory = [];
    }

    // Sync sessionHistory from completed sessions
    if (completedSessions.length > candidate.sessionHistory.filter(s => s.status === 'completed').length) {
        const existingIds = new Set(candidate.sessionHistory.map(s => s.id));
        completedSessions.forEach(session => {
            if (!existingIds.has(session._id.toString())) {
                candidate.sessionHistory.push({
                    id: session._id.toString(),
                    phase: session.lessonType,
                    date: session.date ? session.date.toISOString().split('T')[0] : '',
                    time: session.time || '',
                    status: 'completed'
                });
                needsSave = true;
            }
        });
    }

    // Save if any changes were made
    if (needsSave) {
        await candidate.save();
    }

    res.status(200).json({
        success: true,
        data: candidate
    });
});

// @desc    Create new candidate
// @route   POST /api/v1/candidates
// @access  Private
export const addCandidate = asyncHandler(async (req, res, next) => {
    // Check if candidate with email already exists (exclude deleted candidates)
    const existingCandidate = await Candidate.findOne({
        email: req.body.email,
        status: { $ne: 'deleted' }
    });

    if (existingCandidate) {
        return next(new AppError('Candidate with this email already exists', 400));
    }

    // Default required documents
    const defaultDocuments = [
        { name: 'Birth certificate', checked: false },
        { name: 'Residence certificate', checked: false },
        { name: '6 photos', checked: false },
        { name: 'Medical certificate', checked: false },
        { name: 'National ID copy', checked: false },
        { name: 'Parental authorization (if under 19)', checked: false }
    ];

    // Default phases
    const defaultPhases = [
        { phase: 'highway_code', status: 'in_progress', sessionsCompleted: 0, sessionsPlan: 10, examPassed: false, examAttempts: 0 },
        { phase: 'parking', status: 'not_started', sessionsCompleted: 0, sessionsPlan: 10, examPassed: false, examAttempts: 0 },
        { phase: 'driving', status: 'not_started', sessionsCompleted: 0, sessionsPlan: 10, examPassed: false, examAttempts: 0 }
    ];

    // If there's an initial payment, create a payment record
    const initialPayments = [];
    if (req.body.paidAmount && req.body.paidAmount > 0) {
        initialPayments.push({
            id: `payment-${Date.now()}`,
            amount: req.body.paidAmount,
            date: new Date().toISOString().split('T')[0],
            note: 'Initial payment at registration'
        });
    }

    const candidateData = {
        ...req.body,
        documents: req.body.documents || defaultDocuments,
        phases: req.body.phases || defaultPhases,
        payments: req.body.payments || initialPayments,
        examHistory: req.body.examHistory || [],
        sessionHistory: req.body.sessionHistory || []
    };

    const candidate = await Candidate.create(candidateData);

    res.status(201).json({
        success: true,
        data: candidate,
        message: 'Candidate created successfully'
    });
});

// @desc    Update candidate
// @route   PUT /api/v1/candidates/:id
// @access  Private
export const updateCandidate = asyncHandler(async (req, res, next) => {
    let candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
        return next(new AppError('Candidate not found', 404));
    }

    // Check if email is being changed and if new email already exists
    if (req.body.email && req.body.email !== candidate.email) {
        const emailExists = await Candidate.findOne({ email: req.body.email });
        if (emailExists) {
            return next(new AppError('Email already in use', 400));
        }
    }

    candidate = await Candidate.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        data: candidate,
        message: 'Candidate updated successfully'
    });
});

// @desc    Delete candidate (soft delete - set status to deleted)
// @route   DELETE /api/v1/candidates/:id
// @access  Private
export const deleteCandidate = asyncHandler(async (req, res, next) => {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
        return next(new AppError('Candidate not found', 404));
    }

    // Soft delete - set status to deleted
    candidate.status = 'deleted';
    await candidate.save();

    res.status(200).json({
        success: true,
        data: {},
        message: 'Candidate deleted successfully'
    });
});

// @desc    Get total number of candidates
// @route   GET /api/v1/candidates/count
// @access  Private
export const getCandidateCount = asyncHandler(async (req, res, next) => {
    const total = await Candidate.countDocuments({ status: { $ne: 'deleted' } });

    res.status(200).json({
        success: true,
        data: {
            total
        }
    });
});

// @desc    Update candidate progress
// @route   PUT /api/v1/candidates/:id/progress
// @access  Private
export const updateProgress = asyncHandler(async (req, res, next) => {
    const { progress } = req.body;

    if (!progress || !['highway_code', 'parking', 'driving'].includes(progress)) {
        return next(new AppError('Invalid progress value', 400));
    }

    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
        return next(new AppError('Candidate not found', 404));
    }

    candidate.progress = progress;
    await candidate.save();

    res.status(200).json({
        success: true,
        data: candidate,
        message: 'Progress updated successfully'
    });
});

