// backend/src/config/env.config.js
import dotenv from 'dotenv';

dotenv.config();

// requirred environment variables
const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'MONGO_URI',
    'JWT_SECRT'
];

// validate environment variables
export const validateEnv = () => {
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error('missing required environment variables:');
        missingVars.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('\ncheck the .env file and make sure all required variables are set.');
        process.exit(1);
    }

    // validate JWT_SECRET length
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        console.error('make the lenght of JWT_SECRET at lease 32 chars');
        process.exit(1);
    }

    // validate PORT
    const port = parseInt(process.env.PORT);
    if (isNaN(port) || port < 1 || port > 65535) {
        console.error('PORT must be a number between 1 and 65535');
        process.exit(1);
    }

    console.log('environment variables validated successfully');
};

// export configuration object
export const config = {
    // server
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 5000,
    host: process.env.HOST || 'localhost',

    // database
    mongoUri: process.env.MONGO_URI,

    // JWT
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    jwtCookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE) || 7,

    // CORS
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

    // pagination
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE) || 100,

    // email (not needed now but if needed in future)
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT) || 587,
    smtpEmail: process.env.SMTP_EMAIL,
    smtpPassword: process.env.SMTP_PASSWORD,

    // file uploads (if needed in future)
    maxFileUpload: parseInt(process.env.MAX_FILE_UPLOAD) || 5000000,
    fileUploadPath: process.env.FILE_UPLOAD_PATH || './uploads'
};

export default config;