// backend/src/middleware/rateLimiter.middleware.js
import rateLimit from 'express-rate-limit'; // npm install express-rate-limit

// Login rate limiter: 5 attempts per 15 minutes
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: {
        success: false,
        error: 'Too many login attempts from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful login attempts
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Too many login attempts. Please try again after 15 minutes',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

// Register rate limiter: 3 attempts per hour
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        success: false,
        error: 'Too many accounts created from this IP, please try again after an hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
});

// General API rate limiter - 200 requests per 15 minutes
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Too many requests. Please slow down and try again in a moment.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000) // in seconds
        });
    }
});

// Strict rate limiter for sensitive operations: 10 requests per 15 minutes
export const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests
    message: {
        success: false,
        error: 'Too many requests for this operation, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Password reset limiter: 3 attempts per hour
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts
    message: {
        success: false,
        error: 'Too many password reset attempts, please try again after an hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});