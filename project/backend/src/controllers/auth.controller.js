// backend/src/controllers/auth.controller.js
import Admin from "../models/admin.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";
import { sendPasswordResetEmail } from "../utils/email.js";

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

export const loginAdmin = asyncHandler(async (req, res, next) => {
    const { username, email, password } = req.body;

    console.log('Login attempt:', { username, email });

    // Validate input
    if (!username || !email || !password) {
        return next(new AppError('Please provide username, email, and password', 400));
    }

    // Find admin by email (since email is unique)
    const admin = await Admin.findOne({ 
        email: email.toLowerCase().trim()
    }).select('+password');

    if (!admin) {
        console.log('No admin found with email:', email);
        return next(new AppError('Invalid credentials', 401));
    }

    // Check if name (username) matches (case-insensitive)
    if (admin.name.toLowerCase() !== username.toLowerCase().trim()) {
        console.log('Username mismatch. DB name:', admin.name, 'Provided username:', username);
        return next(new AppError('Invalid credentials', 401));
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
        console.log('Password invalid');
        return next(new AppError('Invalid credentials', 401));
    }

    console.log('Login successful for:', admin.email);

    res.status(200).json({
        success: true,
        data: {
            id: admin._id,
            name: admin.name, // This is the username
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

// @desc    Forgot password - send reset email
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError('Please provide an email address', 400));
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    // Always return success to prevent email enumeration attacks
    if (!admin) {
        return res.status(200).json({
            success: true,
            message: 'If an account exists with this email, you will receive password reset instructions.'
        });
    }

    // Generate reset token
    const resetToken = admin.createPasswordResetToken();
    await admin.save({ validateBeforeSave: false });

    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    try {
        await sendPasswordResetEmail(admin.email, resetUrl, admin.name);

        res.status(200).json({
            success: true,
            message: 'Password reset email sent successfully'
        });
    } catch (error) {
        // If email fails, clear the reset token
        admin.passwordResetToken = undefined;
        admin.passwordResetExpires = undefined;
        await admin.save({ validateBeforeSave: false });

        console.error('Email sending error:', error);
        return next(new AppError('There was an error sending the email. Please try again later.', 500));
    }
});

// @desc    Reset password with token
// @route   POST /api/v1/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return next(new AppError('Please provide token and new password', 400));
    }

    if (password.length < 6) {
        return next(new AppError('Password must be at least 6 characters', 400));
    }

    // Hash the token from the URL to compare with stored hash
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // Find admin with valid token that hasn't expired
    const admin = await Admin.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    }).select('+passwordResetToken +passwordResetExpires');

    if (!admin) {
        return next(new AppError('Token is invalid or has expired', 400));
    }

    // Update password and clear reset token
    admin.password = password;
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    admin.lastPasswordChange = new Date();
    await admin.save();

    // Generate new JWT token
    const jwtToken = generateToken(admin._id);

    res.status(200).json({
        success: true,
        message: 'Password reset successful',
        data: {
            token: jwtToken
        }
    });
});

