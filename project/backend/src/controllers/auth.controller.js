// backend/src/controllers/auth.controller.js
import Admin from "../models/admin.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Login admin
// @route   POST /api/v1/auth/login
// @access  Public
export const loginAdmin = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Find admin with password field
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
        return next(new AppError('Invalid credentials', 401));
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
        return next(new AppError('Invalid credentials', 401));
    }

    res.status(200).json({
        success: true,
        data: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            token: generateToken(admin._id)
        }
    });
});

// @desc    Get current logged in admin
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
    const admin = await Admin.findById(req.admin.id);

    res.status(200).json({
        success: true,
        data: {
            id: admin._id,
            name: admin.name,
            email: admin.email
        }
    });
});

// @desc    Update admin email
// @route   PUT /api/v1/auth/email
// @access  Private
export const updateEmail = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email) {
        return next(new AppError('Please provide new email', 400));
    }

    if (!password) {
        return next(new AppError('Please provide current password to confirm', 400));
    }

    const admin = await Admin.findById(req.admin.id).select('+password');

    // Verify current password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
        return next(new AppError('Password is incorrect', 401));
    }

    // Check if email is already in use
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== admin.email) {
        const emailExists = await Admin.findOne({ email: normalizedEmail });
        if (emailExists) {
            return next(new AppError('Email already in use', 400));
        }
    }

    admin.email = normalizedEmail;
    await admin.save();

    res.status(200).json({
        success: true,
        message: 'Email updated successfully',
        data: {
            email: admin.email
        }
    });
});

// @desc    Update admin password
// @route   PUT /api/v1/auth/password
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return next(new AppError('Please provide current and new password', 400));
    }

    if (newPassword.length < 6) {
        return next(new AppError('New password must be at least 6 characters', 400));
    }

    const admin = await Admin.findById(req.admin.id).select('+password');

    // Check current password
    const isPasswordValid = await admin.comparePassword(currentPassword);
    if (!isPasswordValid) {
        return next(new AppError('Current password is incorrect', 401));
    }

    admin.password = newPassword;
    admin.lastPasswordChange = new Date();
    await admin.save();

    res.status(200).json({
        success: true,
        message: 'Password updated successfully',
        data: {
            token: generateToken(admin._id)
        }
    });
});

// @desc    Update admin name (username)
// @route   PUT /api/v1/auth/name
// @access  Private
export const updateName = asyncHandler(async (req, res, next) => {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
        return next(new AppError('Name must be at least 2 characters', 400));
    }

    const admin = await Admin.findById(req.admin.id);
    admin.name = name.trim();
    await admin.save();

    res.status(200).json({
        success: true,
        message: 'Name updated successfully',
        data: {
            name: admin.name
        }
    });
});

// @desc    Logout admin (client-side token removal)
// @route   POST /api/v1/auth/logout
// @access  Private
export const logoutAdmin = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

