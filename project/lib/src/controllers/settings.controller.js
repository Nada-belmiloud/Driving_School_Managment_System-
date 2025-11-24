import os from "os";
import mongoose from "mongoose";
import Admin from "../models/admin.model.js";
import Backup from "../models/backup.model.js";
import Student from "../models/student.model.js";
import Instructor from "../models/instructor.model.js";
import Lesson from "../models/lesson.model.js";
import Vehicle from "../models/vehicle.model.js";
import Payment from "../models/payment.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

const DEFAULT_NOTIFICATION_SETTINGS = {
    emailEnabled: true,
    emailNewStudent: true,
    emailLessonReminder: true,
    emailPaymentReceived: true,
    emailSystemUpdate: false,
    emailWeeklyReport: true,
    smsEnabled: false,
    smsLessonReminder: false,
    smsPaymentDue: false,
    smsEmergency: true,
    pushEnabled: true,
    pushNewStudent: true,
    pushLessonStart: true,
    pushPaymentReceived: true,
    pushSystemAlert: true,
    inAppEnabled: true,
    inAppNewStudent: true,
    inAppLessonUpdate: true,
    inAppPayment: true,
    inAppChat: true
};

const DEFAULT_APPEARANCE_SETTINGS = {
    theme: 'light',
    fontSize: 'medium',
    sidebarPosition: 'left',
    compactMode: false,
    colorScheme: 'blue',
    showAnimations: true,
    highContrast: false
};

const allowedNotificationKeys = new Set(Object.keys(DEFAULT_NOTIFICATION_SETTINGS));
const allowedAppearanceFields = new Set(Object.keys(DEFAULT_APPEARANCE_SETTINGS));

const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days) parts.push(`${days} day${days === 1 ? '' : 's'}`);
    if (hours) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
    if (minutes) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);

    return parts.length ? parts.join(', ') : 'just started';
};

const ensureAdmin = async (adminId) => {
    const admin = await Admin.findById(adminId);
    if (!admin) {
        throw new AppError('Admin account not found', 404);
    }
    return admin;
};

const mergeWithDefaults = (current, defaults) => ({
    ...defaults,
    ...(current ? (current.toObject ? current.toObject() : current) : {})
});

export const getSettings = asyncHandler(async (req, res) => {
    const admin = await ensureAdmin(req.admin.id);
    const backups = await Backup.find({ admin: admin._id }).sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
        success: true,
        data: {
            profile: {
                name: admin.name,
                email: admin.email,
                role: admin.role
            },
            notificationSettings: mergeWithDefaults(admin.notificationSettings, DEFAULT_NOTIFICATION_SETTINGS),
            appearanceSettings: mergeWithDefaults(admin.appearanceSettings, DEFAULT_APPEARANCE_SETTINGS),
            securitySettings: {
                twoFactorEnabled: admin.securitySettings?.twoFactorEnabled ?? false,
                lastPasswordChange: admin.securitySettings?.lastPasswordChange,
                activeSessions: admin.securitySettings?.activeSessions ?? []
            },
            backupSettings: {
                automatic: admin.backupSettings?.automatic ?? true,
                retentionDays: admin.backupSettings?.retentionDays ?? 30,
                lastBackupAt: admin.backupSettings?.lastBackupAt
            },
            backups
        }
    });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const admin = await ensureAdmin(req.admin.id);
    const { name, email } = req.body;

    if (!name && !email) {
        throw new AppError('Please provide a name or email to update', 400);
    }

    if (name) {
        admin.name = name.trim();
    }

    if (email) {
        const normalizedEmail = email.trim().toLowerCase();
        if (normalizedEmail !== admin.email) {
            const exists = await Admin.findOne({ email: normalizedEmail });
            if (exists) {
                throw new AppError('Another admin already uses this email', 400);
            }
        }
        admin.email = normalizedEmail;
    }

    await admin.save();

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            name: admin.name,
            email: admin.email,
            role: admin.role
        }
    });
});

export const getNotificationSettings = asyncHandler(async (req, res) => {
    const admin = await ensureAdmin(req.admin.id);
    res.status(200).json({
        success: true,
        data: mergeWithDefaults(admin.notificationSettings, DEFAULT_NOTIFICATION_SETTINGS)
    });
});

export const updateNotificationSettings = asyncHandler(async (req, res) => {
    const admin = await ensureAdmin(req.admin.id);
    const updates = {};

    Object.entries(req.body || {}).forEach(([key, value]) => {
        if (allowedNotificationKeys.has(key)) {
            updates[key] = Boolean(value);
        }
    });

    if (!Object.keys(updates).length) {
        throw new AppError('No valid notification settings provided', 400);
    }

    admin.notificationSettings = {
        ...mergeWithDefaults(admin.notificationSettings, DEFAULT_NOTIFICATION_SETTINGS),
        ...updates
    };

    await admin.save();

    res.status(200).json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: admin.notificationSettings
    });
});

export const getAppearanceSettings = asyncHandler(async (req, res) => {
    const admin = await ensureAdmin(req.admin.id);
    res.status(200).json({
        success: true,
        data: mergeWithDefaults(admin.appearanceSettings, DEFAULT_APPEARANCE_SETTINGS)
    });
});


