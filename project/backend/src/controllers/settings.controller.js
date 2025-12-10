// backend/src/controllers/settings.controller.js
import Admin from "../models/admin.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

// @desc    Get current settings (profile info)
// @route   GET /api/v1/settings
// @access  Private
export const getSettings = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
        throw new AppError('Admin account not found', 404);
    }

    res.status(200).json({
        success: true,
        data: {
            profile: {
                name: admin.name,
                email: admin.email
            },
            lastPasswordChange: admin.lastPasswordChange
        }
    });
});

// @desc    Update admin name
// @route   PUT /api/v1/settings/name
// @access  Private
export const updateName = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
        throw new AppError('Name must be at least 2 characters', 400);
    }

    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
        throw new AppError('Admin account not found', 404);
    }

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

// @desc    Update admin email
// @route   PUT /api/v1/settings/email
// @access  Private
export const updateEmail = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new AppError('Please provide new email', 400);
    }

    if (!password) {
        throw new AppError('Please provide current password to confirm', 400);
    }

    const admin = await Admin.findById(req.admin.id).select('+password');

    if (!admin) {
        throw new AppError('Admin account not found', 404);
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
        throw new AppError('Password is incorrect', 401);
    }

    // Check if email is already in use
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== admin.email) {
        const emailExists = await Admin.findOne({ email: normalizedEmail });
        if (emailExists) {
            throw new AppError('Email already in use', 400);
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
// @route   PUT /api/v1/settings/password
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new AppError('Please provide current and new password', 400);
    }

    if (newPassword.length < 6) {
        throw new AppError('New password must be at least 6 characters', 400);
    }

    const admin = await Admin.findById(req.admin.id).select('+password');

    if (!admin) {
        throw new AppError('Admin account not found', 404);
    }

    // Check current password
    const isPasswordValid = await admin.comparePassword(currentPassword);
    if (!isPasswordValid) {
        throw new AppError('Current password is incorrect', 401);
    }

    admin.password = newPassword;
    admin.lastPasswordChange = new Date();
    await admin.save();

    res.status(200).json({
        success: true,
        message: 'Password updated successfully'
    });
});

