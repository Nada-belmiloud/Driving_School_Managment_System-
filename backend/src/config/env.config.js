// backend/src/config/env.config.js
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Required environment variables
const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'MONGO_URI',
    'JWT_SECRET'
];

// Validate environment variables
export const validateEnv = () => {
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:');
        missingVars.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('\nPlease check your .env file and ensure all required variables are set.');
        process.exit(1);
    }

    // Validate JWT_SECRET length
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        console.error('❌ JWT_SECRET must be at least 32 characters long for security');
        process.exit(1);
    }

    // Validate PORT
    const port = parseInt(process.env.PORT);
    if (isNaN(port) || port < 1 || port > 65535) {
        console.error('❌ PORT must be a valid number between 1 and 65535');
        process.exit(1);
    }

    console.log('✅ Environment variables validated successfully');
};

// Export configuration object
export const config = {
    // Server
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 5000,
    host: process.env.HOST || 'localhost',

    // Database
    mongoUri: process.env.MONGO_URI,

    // JWT
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    jwtCookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE) || 7,

    // CORS
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

    // Pagination
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE) || 100,

    // Email (if needed in future)
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT) || 587,
    smtpEmail: process.env.SMTP_EMAIL,
    smtpPassword: process.env.SMTP_PASSWORD,

    // File uploads (if needed in future)
    maxFileUpload: parseInt(process.env.MAX_FILE_UPLOAD) || 5000000,
    fileUploadPath: process.env.FILE_UPLOAD_PATH || './uploads'
};

export default config;