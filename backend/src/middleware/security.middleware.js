// backend/src/middleware/security.middleware.js
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

// Helmet configuration for security headers
export const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
});

// MongoDB injection prevention
export const mongoSanitizeConfig = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`⚠️  Sanitized key "${key}" in ${req.method} ${req.path}`);
    },
});

// XSS prevention
export const xssConfig = xss();

// Custom security middleware
export const customSecurityHeaders = (req, res, next) => {
    // Remove potentially dangerous headers
    res.removeHeader('X-Powered-By');

    // Add custom security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    next();
};

// Request sanitization middleware
export const sanitizeRequest = (req, res, next) => {
    // Remove any potentially dangerous characters from query params
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = req.query[key].trim();
            }
        });
    }

    // Remove any potentially dangerous characters from body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        });
    }

    next();
};

// Prevent parameter pollution
export const preventParamPollution = (req, res, next) => {
    // List of parameters that should only have single values
    const singleValueParams = ['page', 'limit', 'sort', 'sortBy'];

    if (req.query) {
        singleValueParams.forEach(param => {
            if (Array.isArray(req.query[param])) {
                req.query[param] = req.query[param][0];
            }
        });
    }

    next();
};