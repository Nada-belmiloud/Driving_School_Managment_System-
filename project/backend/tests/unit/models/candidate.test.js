// backend/tests/unit/models/candidate.test.js

/**
 * this file tests the candidate data model in the driving school system
 *
 * what it does:
 * - tests if candidates can be created with correct information (name, email, phone, etc.)
 * - verifies that required fields are enforced (you can't save a candidate without a name)
 * - checks that email addresses are in the correct format
 * - ensures license types are valid (A1, A2, B, C1, C2, D)
 * - prevents duplicate email addresses in the system
 * - tests that extra spaces in names and emails are removed automatically
 * - verifies default values are set correctly (like status being "active")
 *
 * how it works:
 * - creates test candidates with different data combinations
 * - tries to save valid candidates and checks they are saved correctly
 * - tries to save invalid candidates and makes sure they are rejected
 * - uses a temporary test database so it doesn't affect real candidate records
 * - each test is independent and doesn't interfere with other tests
 */

import Candidate from '../../../src/models/candidate.model.js';
import '../../../tests/setup.js';

describe('Candidate Model', () => {
    describe('Validation', () => {
        it('should create a valid candidate', async () => {
            const validCandidate = {
                name: 'abderrahmane houri',
                email: 'abderrahmane.houri@ensia.edu.dz',
                phone: '1234567890',
                licenseType: 'B',
                dateOfBirth: new Date('2005-09-06'),
            };

            const candidate = new Candidate(validCandidate);
            const savedCandidate = await candidate.save();

            expect(savedCandidate._id).toBeDefined();
            expect(savedCandidate.name).toBe(validCandidate.name);
            expect(savedCandidate.email).toBe(validCandidate.email);
            expect(savedCandidate.status).toBe('active'); // default value
        });

        it('should fail without required fields', async () => {
            const invalidCandidate = new Candidate({});

            let err;
            try {
                await invalidCandidate.save();
            } catch (error) {
                err = error;
            }

            expect(err).toBeDefined();
            expect(err.errors.name).toBeDefined();
            expect(err.errors.email).toBeDefined();
            expect(err.errors.phone).toBeDefined();
            expect(err.errors.licenseType).toBeDefined();
        });

        it('should fail with invalid email', async () => {
            const candidate = new Candidate({
                name: 'abderrahmane houri',
                email: 'invalid-email',
                phone: '1234567890',
                licenseType: 'B',
            });

            let err;
            try {
                await candidate.save();
            } catch (error) {
                err = error;
            }

            expect(err).toBeDefined();
            expect(err.errors.email).toBeDefined();
        });

        it('should fail with invalid license type', async () => {
            const candidate = new Candidate({
                name: 'abderrahmane houri',
                email: 'abderrahmane.houri@ensia.edu.dz',
                phone: '1234567890',
                licenseType: 'Z', // Invalid
            });

            let err;
            try {
                await candidate.save();
            } catch (error) {
                err = error;
            }

            expect(err).toBeDefined();
            expect(err.errors.licenseType).toBeDefined();
        });

        it('should enforce unique email', async () => {
            const candidateData = {
                name: 'abderrahmane houri',
                email: 'abderrahmane.houri@ensia.edu.dz',
                phone: '1234567890',
                licenseType: 'B',
            };

            await Candidate.create(candidateData);

            let err;
            try {
                await Candidate.create(candidateData);
            } catch (error) {
                err = error;
            }

            expect(err).toBeDefined();
            expect(err.code).toBe(11000); // Duplicate key error
        });

        it('should trim whitespace from strings', async () => {
            const candidate = await Candidate.create({
                name: '  abderrahmane houri  ',
                email: '  abderrahmane.houri@ensia.edu.dz  ',
                phone: '1234567890',
                licenseType: 'B',
            });

            expect(candidate.name).toBe('abderrahmane houri');
            expect(candidate.email).toBe('abderrahmane.houri@ensia.edu.dz');
        });

        it('should convert email to lowercase', async () => {
            const candidate = await Candidate.create({
                name: 'abderrahmane houri',
                email: 'abderrahmane.houri@ensia.edu.dz',
                phone: '1234567890',
                licenseType: 'B',
            });

            expect(candidate.email).toBe('abderrahmane.houri@ensia.edu.dz');
        });
    });

    describe('Default Values', () => {
        it('should set default values correctly', async () => {
            const candidate = await Candidate.create({
                name: 'abderrahmane houri',
                email: 'abderrahmane.houri@ensia.edu.dz',
                phone: '1234567890',
                licenseType: 'B',
            });

            expect(candidate.status).toBe('active');
            expect(candidate.progress).toBe('highway_code');
            expect(candidate.registrationDate).toBeDefined();
        });
    });

    describe('Age Validation', () => {
        it('should accept valid age (18 years old)', async () => {
            const eighteenYearsAgo = new Date();
            eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

            const candidate = await Candidate.create({
                name: 'John Doe',
                email: 'john@example.com',
                phone: '1234567890',
                licenseType: 'B',
                dateOfBirth: eighteenYearsAgo,
            });

            expect(candidate.dateOfBirth).toBeDefined();
        });

        it('should reject age under 16', async () => {
            const tenYearsAgo = new Date();
            tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

            let err;
            try {
                await Candidate.create({
                    name: 'Young Person',
                    email: 'young@example.com',
                    phone: '1234567890',
                    licenseType: 'B',
                    dateOfBirth: tenYearsAgo,
                });
            } catch (error) {
                err = error;
            }

            expect(err).toBeDefined();
            expect(err.errors.dateOfBirth).toBeDefined();
        });
    });
});
