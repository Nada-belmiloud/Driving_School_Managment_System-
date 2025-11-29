// backend/src/server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

// import configurations
import { validateEnv, config } from "./config/env.config.js";
import connectDB from "./config/db.js";
import logger from "./config/logger.config.js";
import { swaggerSpec, swaggerUi, swaggerUiOptions } from "./config/swagger.config.js";

// import middleware
import { errorHandler } from "./middleware/error.middleware.js";
import { morganMiddleware, requestLogger, errorLogger } from "./middleware/logger.middleware.js";
import { apiLimiter } from "./middleware/rateLimiter.middleware.js";
import {
    helmetConfig,
    mongoSanitizeConfig,
    xssConfig,
    customSecurityHeaders,
    sanitizeRequest,
    preventParamPollution
} from "./middleware/security.middleware.js";

// validate environment variables first
validateEnv();

// get dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// initialize express app
const app = express();

// connect to MongoDB
connectDB();

// trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// security middleware (applied early in the chain)
app.use(helmetConfig);
app.use(customSecurityHeaders);
app.use(mongoSanitizeConfig);
app.use(xssConfig);
app.use(sanitizeRequest);
app.use(preventParamPollution);

// CORS configuration
app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// logging middleware
app.use(morganMiddleware);
if (config.nodeEnv === 'development') {
    app.use(requestLogger);
}

// apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// import routes
import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import instructorRoutes from "./routes/instructor.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import lessonRoutes from "./routes/lesson.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

// API route; Version 1
const API_VERSION = '/api/v1';

// swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// API routes
app.use(`${API_VERSION}/auth`, authRoutes);
app.use(`${API_VERSION}/students`, studentRoutes);
app.use(`${API_VERSION}/instructors`, instructorRoutes);
app.use(`${API_VERSION}/vehicles`, vehicleRoutes);
app.use(`${API_VERSION}/lessons`, lessonRoutes);
app.use(`${API_VERSION}/payments`, paymentRoutes);
app.use(`${API_VERSION}/settings`, settingsRoutes);
app.use(`${API_VERSION}/dashboard`, dashboardRoutes);

// health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        uptime: process.uptime(),
    });
});

// API information endpoint
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Driving School Management System API",
        version: "1.0.0",
        environment: config.nodeEnv,
        endpoints: {
            documentation: '/api-docs',
            health: '/health',
            auth: `${API_VERSION}/auth`,
            students: `${API_VERSION}/students`,
            instructors: `${API_VERSION}/instructors`,
            vehicles: `${API_VERSION}/vehicles`,
            lessons: `${API_VERSION}/lessons`,
            payments: `${API_VERSION}/payments`,
            settings: `${API_VERSION}/settings`,
            dashboard: `${API_VERSION}/dashboard`
        },
        documentation: "Visit /api-docs for interactive API documentation"
    });
});

// 404 handler
app.use((req, res, next) => {
    logger.warn('Route not found', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
    });

    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
});

// Error logging middleware
app.use(errorLogger);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
const server = app.listen(PORT, () => {
    logger.info(`Server started successfully on port ${PORT}`);
    console.log(`
    Driving School Management System API
                                                           
    environment: ${config.nodeEnv.padEnd(44)}
    server running on port: ${PORT.toString().padEnd(36)}
    API base URL: http://localhost:${PORT}${API_VERSION.padEnd(21)}
    documentation: http://localhost:${PORT}/api-docs${' '.repeat(17)}║
                                                            
    endpoints:                                 
    • Auth:        ${API_VERSION}/auth${' '.repeat(30)}
    • Students:    ${API_VERSION}/students${' '.repeat(26)}
    • Instructors: ${API_VERSION}/instructors${' '.repeat(23)}
    • Vehicles:    ${API_VERSION}/vehicles${' '.repeat(26)}
    • Lessons:     ${API_VERSION}/lessons${' '.repeat(27)}
    • Payments:    ${API_VERSION}/payments${' '.repeat(26)}
    • Settings:    ${API_VERSION}/settings${' '.repeat(26)}
                                                            
    security Features Enabled:                           
    • Rate Limiting ✓                                       
    • Helmet Security Headers ✓                           
    • MongoDB Sanitization ✓                               
    • XSS Protection ✓                                     
    • Request Logging ✓                                    
    `);
});

// handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection', {
        error: err.message,
        stack: err.stack,
    });
    console.error(`Unhandled Rejection: ${err.message}`);

    // close server & exit process
    server.close(() => {
        logger.info('server closed due to unhandled rejection');
        process.exit(1);
    });
});

// handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', {
        error: err.message,
        stack: err.stack,
    });
    console.error(`Uncaught Exception: ${err.message}`);

    // exit process
    process.exit(1);
});

// graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
    });
});

export default app;