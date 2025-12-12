// backend/src/middleware/security.middleware.js

/**
 * SECURITY MIDDLEWARE
 * ===================
 *
 * This file contains middleware functions that protect the application from common
 * web security vulnerabilities and attacks.
 * SECURITY PROTECTIONS PROVIDED:
 *
 * 1. Helmet (helmetConfig):
 *    - Sets various HTTP headers to protect against common attacks
 *    - Content Security Policy: Controls what resources the browser can load
 *    - Prevents clickjacking, XSS, and other header-based attacks
 *
 * 2. MongoDB Injection Prevention (mongoSanitizeConfig):
 *    - Removes special characters like $ and . from user input
 *    - Prevents attackers from injecting malicious MongoDB queries
 *    - Example: Prevents {"$gt": ""} in username field to bypass login
 *
 * 3. XSS Prevention (xssConfig):
 *    - Cleans user input to remove malicious scripts
 *    - Prevents Cross-Site Scripting attacks where attackers inject JavaScript
 *    - Example: Prevents <script>alert('hacked')</script> in user input
 *
 * 4. Custom Security Headers (customSecurityHeaders):
 *    - Removes X-Powered-By header to hide server technology
 *    - Adds additional security headers for extra protection
 *    - Enforces HTTPS and prevents content type sniffing
 *
 * 5. Request Sanitization (sanitizeRequest):
 *    - Trims whitespace from all string inputs
 *    - Cleans both URL parameters and request body data
 *    - Helps maintain data consistency and prevents bypass attempts
 *
 * 6. Parameter Pollution Prevention (preventParamPollution):
 *    - Ensures certain parameters only have single values
 *    - Prevents attacks using duplicate parameters (e.g., ?page=1&page=100)
 *    - Protects pagination and sorting functionality
 *
 * HOW TO USE:
 * Import these middleware functions in your main server file (app.js or server.js)
 * and apply them using app.use() before your route handlers.
 *
 * Example:
 *   import { helmetConfig, mongoSanitizeConfig, xssConfig,
 *            customSecurityHeaders, sanitizeRequest,
 *            preventParamPollution } from './middleware/security.middleware.js';
 *
 *   app.use(helmetConfig);
 *   app.use(mongoSanitizeConfig);
 *   app.use(xssConfig);
 *   app.use(customSecurityHeaders);
 *   app.use(sanitizeRequest);
 *   app.use(preventParamPollution);
 */

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