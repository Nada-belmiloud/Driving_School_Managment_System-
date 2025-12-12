// backend/src/middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import { asyncHandler, AppError } from "./error.middleware.js";

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Not authorized to access this route', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.admin = await Admin.findById(decoded.id).select('-password');

        if (!req.admin) {
            return next(new AppError('User not found', 401));
        }

        next();
    } catch (error) {
        return next(new AppError('Not authorized to access this route', 401));
    }
});

// Validation middleware
export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    next();
};

// Validate candidate (renamed from student)
export const validateCandidate = (req, res, next) => {
    // Only require all fields for POST (create), not for PUT (update)
    if (req.method === 'POST') {
        const { name, email, phone, licenseType } = req.body;

        if (!name || !email || !phone || !licenseType) {
            return next(new AppError('Please provide all required fields (name, email, phone, licenseType)', 400));
        }

        // Validate license type
        const validLicenseTypes = ['A1', 'A2', 'B', 'C1', 'C2', 'D'];
        if (!validLicenseTypes.includes(licenseType)) {
            return next(new AppError('License type must be A1, A2, B, C1, C2, or D', 400));
        }
    } else if (req.method === 'PUT') {
        // For updates, validate licenseType only if provided
        const { licenseType } = req.body;
        if (licenseType) {
            const validLicenseTypes = ['A1', 'A2', 'B', 'C1', 'C2', 'D'];
            if (!validLicenseTypes.includes(licenseType)) {
                return next(new AppError('License type must be A1, A2, B, C1, C2, or D', 400));
            }
        }
    }

    next();
};

// Validate instructor
export const validateInstructor = (req, res, next) => {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
        return next(new AppError('Please provide all required fields (name, email, phone)', 400));
    }

    next();
};

// Validate vehicle (simplified)
export const validateVehicle = (req, res, next) => {
    const { brand, model, licensePlate } = req.body;

    if (!brand || !model || !licensePlate) {
        return next(new AppError('Please provide all required fields (brand, model, licensePlate)', 400));
    }

    next();
};

// Validate schedule (renamed from lesson)
export const validateSchedule = (req, res, next) => {
    const { candidateId, instructorId, date, time, lessonType } = req.body;

    if (!candidateId || !instructorId || !date || !time || !lessonType) {
        return next(new AppError('Please provide all required fields (candidateId, instructorId, date, time, lessonType)', 400));
    }

    // Validate time format
    if (typeof time !== 'string' || !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
        return next(new AppError('Time must be in HH:MM format', 400));
    }

    // Validate lesson type
    const validLessonTypes = ['highway_code', 'parking', 'driving'];
    if (!validLessonTypes.includes(lessonType)) {
        return next(new AppError('Lesson type must be highway_code, parking, or driving', 400));
    }

    next();
};

// Validate payment (simplified - cash only)
export const validatePayment = (req, res, next) => {
    const { candidateId, amount } = req.body;

    if (!candidateId || amount === undefined) {
        return next(new AppError('Please provide all required fields (candidateId, amount)', 400));
    }

    if (amount < 0) {
        return next(new AppError('Amount cannot be negative', 400));
    }

    next();
};

// Validate exam
export const validateExam = (req, res, next) => {
    const { candidateId, instructorId, examType, date, time } = req.body;

    if (!candidateId || !instructorId || !examType || !date || !time) {
        return next(new AppError('Please provide all required fields (candidateId, instructorId, examType, date, time)', 400));
    }

    // Validate time format
    if (typeof time !== 'string' || !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
        return next(new AppError('Time must be in HH:MM format', 400));
    }

    // Validate exam type
    const validExamTypes = ['highway_code', 'parking', 'driving'];
    if (!validExamTypes.includes(examType)) {
        return next(new AppError('Exam type must be highway_code, parking, or driving', 400));
    }

    next();
};

// Legacy aliases for backward compatibility
export const validateStudent = validateCandidate;
export const validateLesson = validateSchedule;

