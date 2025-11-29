// backend/tests/integration/auth.test.js

/**
 * this file tests the authentication system of the driving school application
 *
 * what it does:
 * - tests if admins can register with their name, email and password
 * - tests if admins can login with correct credentials
 * - tests if the system rejects wrong passwords or missing information
 * - tests if admins can view their profile information
 * - tests if admins can update their password
 * - makes sure duplicate emails are not allowed
 * - verifies that authentication tokens work correctly
 *
 * how it works:
 * - sends fake http requests to the authentication endpoints
 * - checks if the responses are correct (success or error messages)
 * - uses a temporary test database so real data is not affected
 * - each test starts with a clean database to ensure accurate results
 */

import request from 'supertest';
import app from '../../src/server.js';
import Admin from '../../src/models/admin.model.js';
import '../setup.js';

describe('Authentication API', () => {
    describe('POST /api/v1/auth/register', () => {
        it('should register a new admin', async () => {
            const adminData = {
                name: 'Test Admin',
                email: 'admin@test.com',
                password: 'password123',
            };

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(adminData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.email).toBe(adminData.email);
            expect(response.body.data).not.toHaveProperty('password');
        });

        it('should fail with missing fields', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Test Admin',
                    // missing email and password
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBeDefined();
        });

        it('should fail with duplicate email', async () => {
            const adminData = {
                name: 'Test Admin',
                email: 'admin@test.com',
                password: 'password123',
            };

            // First registration
            await request(app)
                .post('/api/v1/auth/register')
                .send(adminData)
                .expect(201);

            // Duplicate registration
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(adminData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('already exists');
        });

        it('should fail with short password', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Test Admin',
                    email: 'admin@test.com',
                    password: '123', // Too short
                })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            // Create a test admin
            await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Test Admin',
                    email: 'admin@test.com',
                    password: 'password123',
                });
        });

        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'admin@test.com',
                    password: 'password123',
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.email).toBe('admin@test.com');
        });

        it('should fail with wrong password', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'admin@test.com',
                    password: 'wrongpassword',
                })
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Invalid credentials');
        });

        it('should fail with non-existent email', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'password123',
                })
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should fail with missing credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'admin@test.com',
                    // missing password
                })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/auth/me', () => {
        let token;

        beforeEach(async () => {
            // Register and get token
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Test Admin',
                    email: 'admin@test.com',
                    password: 'password123',
                });

            token = response.body.data.token;
        });

        it('should get current admin with valid token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe('admin@test.com');
        });

        it('should fail without token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me')
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should fail with invalid token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', 'Bearer invalidtoken')
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/v1/auth/updatepassword', () => {
        let token;

        beforeEach(async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Test Admin',
                    email: 'admin@test.com',
                    password: 'password123',
                });

            token = response.body.data.token;
        });

        it('should update password with valid credentials', async () => {
            const response = await request(app)
                .put('/api/v1/auth/updatepassword')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    currentPassword: 'password123',
                    newPassword: 'newpassword123',
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');

            // Verify can login with new password
            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'admin@test.com',
                    password: 'newpassword123',
                })
                .expect(200);

            expect(loginResponse.body.success).toBe(true);
        });

        it('should fail with wrong current password', async () => {
            const response = await request(app)
                .put('/api/v1/auth/updatepassword')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    currentPassword: 'wrongpassword',
                    newPassword: 'newpassword123',
                })
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });
});