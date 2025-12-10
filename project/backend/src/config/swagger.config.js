// backend/src/config/swagger.config.js

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import config from './env.config.js';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Driving School Management System API',
        version: '1.0.0',
        description: 'API documentation for the Driving School Management System',
        contact: {
            name: 'API support',
            email: 'support@drivingschool.com',
        },
    },
    servers: [
        {
            url: `http://${config.host}:${config.port}/api/v1`,
            description: 'Development server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter your JWT token in the format: Bearer <token>',
            },
        },
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Error message' },
                },
            },
            Candidate: {
                type: 'object',
                required: ['name', 'email', 'phone', 'licenseType'],
                properties: {
                    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    phone: { type: 'string', example: '1234567890' },
                    address: { type: 'string', example: '123 Main St' },
                    dateOfBirth: { type: 'string', format: 'date', example: '2000-01-15' },
                    licenseType: {
                        type: 'string',
                        enum: ['A1', 'A2', 'B', 'C1', 'C2', 'D'],
                        example: 'B',
                    },
                    status: {
                        type: 'string',
                        enum: ['active', 'completed', 'deleted'],
                        example: 'active',
                    },
                    progress: {
                        type: 'string',
                        enum: ['highway_code', 'parking', 'driving'],
                        example: 'highway_code',
                    },
                },
            },
            Instructor: {
                type: 'object',
                required: ['name', 'email', 'phone'],
                properties: {
                    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    name: { type: 'string', example: 'Jane Smith' },
                    email: { type: 'string', format: 'email', example: 'jane@example.com' },
                    phone: { type: 'string', example: '1234567890' },
                    address: { type: 'string', example: '456 Oak Ave' },
                    assignedVehicle: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    status: {
                        type: 'string',
                        enum: ['active', 'deleted'],
                        example: 'active',
                    },
                },
            },
            Vehicle: {
                type: 'object',
                required: ['brand', 'model', 'licensePlate'],
                properties: {
                    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    brand: { type: 'string', example: 'Toyota' },
                    model: { type: 'string', example: 'Corolla' },
                    licensePlate: { type: 'string', example: 'ABC-123' },
                    assignedInstructor: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    status: {
                        type: 'string',
                        enum: ['active', 'maintenance', 'retired'],
                        example: 'active',
                    },
                },
            },
            MaintenanceLog: {
                type: 'object',
                required: ['vehicleId', 'type', 'description', 'cost'],
                properties: {
                    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    vehicleId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    date: { type: 'string', format: 'date', example: '2024-01-15' },
                    type: {
                        type: 'string',
                        enum: ['oil-change', 'tire-replacement', 'brake-service', 'inspection', 'repair', 'other'],
                        example: 'oil-change',
                    },
                    description: { type: 'string', example: 'Regular oil change' },
                    cost: { type: 'number', example: 50 },
                    performedBy: { type: 'string', example: 'ABC Auto Shop' },
                },
            },
            Schedule: {
                type: 'object',
                required: ['candidateId', 'instructorId', 'date', 'time', 'lessonType'],
                properties: {
                    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    candidateId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    instructorId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    date: { type: 'string', format: 'date', example: '2024-01-15' },
                    time: { type: 'string', example: '10:00' },
                    status: {
                        type: 'string',
                        enum: ['scheduled', 'cancelled', 'completed'],
                        example: 'scheduled',
                    },
                    lessonType: {
                        type: 'string',
                        enum: ['highway_code', 'parking', 'driving'],
                        example: 'parking',
                    },
                },
            },
            Payment: {
                type: 'object',
                required: ['candidateId', 'amount'],
                properties: {
                    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    candidateId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    amount: { type: 'number', example: 100 },
                    status: {
                        type: 'string',
                        enum: ['pending', 'paid'],
                        example: 'pending',
                    },
                    date: { type: 'string', format: 'date', example: '2024-01-15' },
                },
            },
            Exam: {
                type: 'object',
                required: ['candidateId', 'instructorId', 'examType', 'date', 'time'],
                properties: {
                    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    candidateId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    instructorId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    examType: {
                        type: 'string',
                        enum: ['highway_code', 'parking', 'driving'],
                        example: 'highway_code',
                    },
                    date: { type: 'string', format: 'date', example: '2024-01-15' },
                    time: { type: 'string', example: '10:00' },
                    status: {
                        type: 'string',
                        enum: ['scheduled', 'passed', 'failed', 'cancelled'],
                        example: 'scheduled',
                    },
                    attemptNumber: { type: 'number', example: 1 },
                    notes: { type: 'string', example: 'First attempt' },
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
    tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Candidates', description: 'Candidate management' },
        { name: 'Instructors', description: 'Instructor management' },
        { name: 'Vehicles', description: 'Vehicle management' },
        { name: 'Schedule', description: 'Lesson scheduling' },
        { name: 'Payments', description: 'Payment management' },
        { name: 'Exams', description: 'Exam management' },
        { name: 'Settings', description: 'Admin settings' },
        { name: 'Dashboard', description: 'Dashboard statistics' },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };

export const swaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Driving School API Docs',
};

export default { swaggerSpec, swaggerUi, swaggerUiOptions };

