// backend/tests/integration/auth.test.js

/**
 * this file tests the authentication system of the driving school application
 *
 * what it does:
 * - tests if admins can login with correct credentials
 * - tests if the system rejects wrong passwords or missing information
 * - tests if admins can view their profile information
 * - tests if admins can update their password
 * - tests if admins can update their email
 * - tests if admins can update their name
 * - verifies that authentication tokens work correctly
 *
 * Note: Registration is not tested because the system only requires one admin
 * that is seeded via the seedAdmin script.
 *
 * how it works:
 * - creates a test admin directly in the database before tests
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
    // Helper function to create test admin directly in database
    const createTestAdmin = async (data = {}) => {
        const defaultData = {
            name: 'Test Admin',
            email: 'admin@test.com',
            password: 'password123',
        };
        return await Admin.create({ ...defaultData, ...data });
    };

    // Helper function to login and get token
    const loginAndGetToken = async (email = 'admin@test.com', password = 'password123') => {
        const response = await request(app)
            .post('/api/v1/auth/login')
            .send({ email, password });
        return response.body.data?.token;
    };

    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            // Create a test admin directly in database
            await createTestAdmin();
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
            // Create admin and get token
            await createTestAdmin();
            token = await loginAndGetToken();
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

    describe('PUT /api/v1/auth/password', () => {
        let token;

        beforeEach(async () => {
            await createTestAdmin();
            token = await loginAndGetToken();
        });

        it('should update password with valid data', async () => {
            const response = await request(app)
                .put('/api/v1/auth/password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    currentPassword: 'password123',
                    newPassword: 'newpassword123',
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Password updated');

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
                .put('/api/v1/auth/password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    currentPassword: 'wrongpassword',
                    newPassword: 'newpassword123',
                })
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should fail with short new password', async () => {
            const response = await request(app)
                .put('/api/v1/auth/password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    currentPassword: 'password123',
                    newPassword: '123', // Too short
                })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/v1/auth/email', () => {
        let token;

        beforeEach(async () => {
            await createTestAdmin();
            token = await loginAndGetToken();
        });

        it('should update email with valid data', async () => {
            const response = await request(app)
                .put('/api/v1/auth/email')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    email: 'newemail@test.com',
                    password: 'password123',
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe('newemail@test.com');
        });

        it('should fail without password confirmation', async () => {
            const response = await request(app)
                .put('/api/v1/auth/email')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    email: 'newemail@test.com',
                    // missing password
                })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should fail with wrong password', async () => {
            const response = await request(app)
                .put('/api/v1/auth/email')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    email: 'newemail@test.com',
                    password: 'wrongpassword',
                })
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/v1/auth/name', () => {
        let token;

        beforeEach(async () => {
            await createTestAdmin();
            token = await loginAndGetToken();
        });

        it('should update name with valid data', async () => {
            const response = await request(app)
                .put('/api/v1/auth/name')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'New Admin Name',
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('New Admin Name');
        });

        it('should fail with short name', async () => {
            const response = await request(app)
                .put('/api/v1/auth/name')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'A', // Too short
                })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/auth/logout', () => {
        let token;

        beforeEach(async () => {
            await createTestAdmin();
            token = await loginAndGetToken();
        });

        it('should logout successfully', async () => {
            const response = await request(app)
                .post('/api/v1/auth/logout')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Logged out');
        });
    });
});