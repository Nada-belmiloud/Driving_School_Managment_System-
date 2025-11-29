// backend/src/config/swagger.config.js

/**
 * swagger API documentation configuration
 *
 * this file sets up automatic API documentation for the driving school management system.
 * swagger creates a web interface where we (developers) can see all available API endpoints,
 * test them directly in the browser, and understand how to use the API.
 *
 * what this file does:
 * 1. defines the API information (title, version, description)
 * 2. specifies the server URLs where the API can be accessed
 * 3. sets up security (JWT authentication)
 * 4. defines data schemas (Student, Instructor, Vehicle, Lesson, Payment)
 * 5. organizes endpoints into categories (tags)
 * 6. customizes the appearance of the documentation page
 *
 * the documentation will be available at: http://localhost:5000/api-docs
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import config from './env.config.js';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Driving school management system API',
        version: '1.0.0',
        description: 'API documentation for the Driving School Management System',
        contact: {
            name: 'API support',
            email: 'abderrahmane.houri@ensia.edu.dz',
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
        },
    },
    servers: [
        {
            url: `http://${config.host}:${config.port}/api/v1`,
            description: 'Development server',
        },
        {
            url: 'https://api.drivingschool.com/api/v1', // not correct and will be change in production
            description: 'production server',
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
                    success: {
                        type: 'boolean',
                        example: false,
                    },
                    error: {
                        type: 'string',
                        example: 'error message',
                    },
                },
            },
            Student: {
                type: 'object',
                required: ['name', 'email', 'phone', 'licenseType'],
                properties: {
                    _id: {
                        type: 'string',
                        example: '507f1f77bcf86cd799439011',
                    },
                    name: {
                        type: 'string',
                        example: 'abderrahmane houri',
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'abderrahmane.houri@ensia.edu.dz',
                    },
                    phone: {
                        type: 'string',
                        example: '1234567890',
                    },
                    licenseType: {
                        type: 'string',
                        enum: ['A', 'B', 'C', 'D'],
                        example: 'B',
                    },
                    status: {
                        type: 'string',
                        enum: ['active', 'completed', 'suspended', 'dropped'],
                        example: 'active',
                    },
                },
            },
            Instructor: {
                type: 'object',
                required: ['name', 'email', 'phone'],
                properties: {
                    _id: {
                        type: 'string',
                        example: '507f1f77bcf86cd799439011',
                    },
                    name: {
                        type: 'string',
                        example: 'brairi hossam',
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'brairi.hossam@ensia.com',
                    },
                    phone: {
                        type: 'string',
                        example: '1234567890',
                    },
                    experienceYears: {
                        type: 'number',
                        example: 5,
                    },
                    status: {
                        type: 'string',
                        enum: ['active', 'inactive', 'on-leave', 'terminated'],
                        example: 'active',
                    },
                },
            },
            Vehicle: {
                type: 'object',
                required: ['plateNumber', 'model', 'year', 'fuelType', 'transmission'],
                properties: {
                    _id: {
                        type: 'string',
                        example: '507f1f77bcf86cd799439011',
                    },
                    plateNumber: {
                        type: 'string',
                        example: 'ABC-123',
                    },
                    model: {
                        type: 'string',
                        example: 'Toyota Corolla',
                    },
                    year: {
                        type: 'number',
                        example: 2022,
                    },
                    fuelType: {
                        type: 'string',
                        enum: ['petrol', 'diesel', 'electric', 'hybrid'],
                        example: 'petrol',
                    },
                    transmission: {
                        type: 'string',
                        enum: ['manual', 'automatic'],
                        example: 'manual',
                    },
                    status: {
                        type: 'string',
                        enum: ['available', 'in-use', 'maintenance', 'retired'],
                        example: 'available',
                    },
                },
            },
            Lesson: {
                type: 'object',
                required: ['studentId', 'instructorId', 'vehicleId', 'date', 'time'],
                properties: {
                    _id: {
                        type: 'string',
                        example: '507f1f77bcf86cd799439011',
                    },
                    studentId: {
                        type: 'string',
                        example: '507f1f77bcf86cd799439011',
                    },
                    instructorId: {
                        type: 'string',
                        example: '507f1f77bcf86cd799439011',
                    },
                    vehicleId: {
                        type: 'string',
                        example: '507f1f77bcf86cd799439011',
                    },
                    date: {
                        type: 'string',
                        format: 'date',
                        example: '2024-01-15',
                    },
                    time: {
                        type: 'string',
                        pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$',
                        example: '10:00',
                    },
                    duration: {
                        type: 'number',
                        example: 60,
                    },
                    status: {
                        type: 'string',
                        enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'],
                        example: 'scheduled',
                    },
                    lessonType: {
                        type: 'string',
                        enum: ['theory', 'practical', 'test-preparation', 'road-test'],
                        example: 'practical',
                    },
                },
            },
            Payment: {
                type: 'object',
                required: ['studentId', 'amount', 'method'],
                properties: {
                    _id: {
                        type: 'string',
                        example: '507f1f77bcf86cd799439011',
                    },
                    studentId: {
                        type: 'string',
                        example: '507f1f77bcf86cd799439011',
                    },
                    amount: {
                        type: 'number',
                        example: 150.00,
                    },
                    method: {
                        type: 'string',
                        enum: ['cash', 'card', 'transfer', 'check'],
                        example: 'card',
                    },
                    status: {
                        type: 'string',
                        enum: ['pending', 'paid', 'refunded', 'failed'],
                        example: 'paid',
                    },
                    receiptNumber: {
                        type: 'string',
                        example: 'RCP-1234567890',
                    },
                },
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
    tags: [
        {
            name: 'Authentication',
            description: 'Authentication and authorization endpoints',
        },
        {
            name: 'Students',
            description: 'Student management endpoints',
        },
        {
            name: 'Instructors',
            description: 'Instructor management endpoints',
        },
        {
            name: 'Vehicles',
            description: 'Vehicle management endpoints',
        },
        {
            name: 'Lessons',
            description: 'Lesson scheduling and management endpoints',
        },
        {
            name: 'Payments',
            description: 'Payment processing and tracking endpoints',
        },
        {
            name: 'Settings',
            description: 'System settings and configuration endpoints',
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

// custom CSS for Swagger UI
const customCss = `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 50px 0 }
    .swagger-ui .info .title { color: #2c3e50 }
`;

const swaggerUiOptions = {
    customCss,
    customSiteTitle: 'Driving School API Documentation',
    customfavIcon: '/favicon.ico',
};

export { swaggerSpec, swaggerUi, swaggerUiOptions };