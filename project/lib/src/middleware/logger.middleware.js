// backend/src/middleware/logger.middleware.js
import morgan from 'morgan';
import logger from '../config/logger.config.js';
import config from '../config/env.config.js';

// morgan token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
    if (!req._startTime) return '0';
    
    // Defensive check: ensure _startTime is an array (hrtime format)
    // In production, sometimes _startTime might be corrupted or set incorrectly
    if (!Array.isArray(req._startTime) || req._startTime.length !== 2) {
        return '0';
    }
    
    try {
        const diff = process.hrtime(req._startTime);
        const ms = diff[0] * 1e3 + diff[1] * 1e-6;
        /*
            * These two lines calculates the response time in milliseconds from a high-resolution time difference array returned by process.hrtime().
            * diff[0] is the number of seconds, multiplied by 1,000 to convert to milliseconds.
            * diff[1] is the number of nanoseconds, multiplied by 0.000001 to convert to milliseconds.
            * The sum gives the total elapsed time in milliseconds.
            * .toFixed(2) formats the result to two decimal places.
        */
        return ms.toFixed(2);
    } catch (error) {
        // Fallback if hrtime fails
        return '0';
    }
});

// Custom Morgan format
const morganFormat = config.nodeEnv === 'development'
    ? ':method :url :status :response-time ms - :res[content-length]'
    : ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-ms ms';

// Morgan middleware configuration
export const morganMiddleware = morgan(morganFormat, {
    stream: logger.stream,
    skip: (req, res) => {
        // Skip logging health check endpoints
        return req.url === '/health' || req.url === '/';
    },
});

// Request logging middleware
export const requestLogger = (req, res, next) => {
    // Ensure _startTime is set as hrtime array format
    try {
        req._startTime = process.hrtime();
    } catch (error) {
        // Fallback to Date if hrtime fails
        req._startTime = Date.now();
    }

    // Log request details
    logger.info('Incoming Request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });

    // Log response when finished
    res.on('finish', () => {
        let responseTime = '0';
        
        // Defensive check: handle both hrtime array and Date fallback
        try {
            if (Array.isArray(req._startTime) && req._startTime.length === 2) {
                // Standard hrtime format
                const diff = process.hrtime(req._startTime);
                responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2); // convert to milliseconds
            } else if (typeof req._startTime === 'number') {
                // Fallback Date format
                responseTime = (Date.now() - req._startTime).toFixed(2);
            }
        } catch (error) {
            // If calculation fails, use 0 as fallback
            responseTime = '0';
        }

        const logLevel = res.statusCode >= 400 ? 'error' : 'info';

        logger[logLevel]('Response Sent', {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            responseTime: `${responseTime}ms`,
        });
    });

    next();
};

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
    logger.error('Error occurred', {
        error: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });

    next(err);
};

// Authentication logging
export const authLogger = (action, userId, status, details = {}) => {
    logger.info('Authentication Event', {
        action,
        userId,
        status,
        timestamp: new Date().toISOString(),
        ...details,
    });
};

// Database operation logging
export const dbLogger = (operation, collection, status, details = {}) => {
    logger.info('Database Operation', {
        operation,
        collection,
        status,
        timestamp: new Date().toISOString(),
        ...details,
    });
};

// Security event logging
export const securityLogger = (event, level = 'warn', details = {}) => {
    logger[level]('Security Event', {
        event,
        timestamp: new Date().toISOString(),
        ...details,
    });
};