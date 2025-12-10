// backend/src/config/logger.config.js

/**
 * logging configuration
 *
 * this file sets up the logging system for the application.
 * logging means recording what happens in the application (events, errors, etc.)
 * so we can debug issues and monitor the system.
 *
 * what this file does:
 * 1. creates a logger using the Winston library
 * 2. defines how log messages should be formatted (with timestamps, colors, etc.)
 * 3. saves different types of logs to separate files:
 *    - error.log: Only error messages
 *    - info.log: General information messages
 *    - combined.log: All log messages
 *    - exceptions.log: Unexpected crashes
 *    - rejections.log: Promise rejection errors
 * 4. shows colored logs in the console during development
 *
 * logs are stored in the 'logs' folder with a maximum size of 5MB per file.
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './env.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
    })
);

// create logger instance
const logger = winston.createLogger({
    level: config.nodeEnv === 'development' ? 'debug' : 'info',
    format: logFormat,
    defaultMeta: { service: 'driving-school-api' },
    transports: [
        // error logs
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // combined logs
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // success/Info logs
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/info.log'),
            level: 'info',
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
    // handle exceptions and rejections
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/exceptions.log'),
        }),
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/rejections.log'),
        }),
    ],
});

// add console transport in development
if (config.nodeEnv !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: consoleFormat,
        })
    );
}

// create a stream object for Morgan
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};

export default logger;