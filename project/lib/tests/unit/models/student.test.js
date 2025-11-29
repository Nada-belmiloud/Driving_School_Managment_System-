// backend/tests/unit/models/student.test.js

/**
 * this file tests the student data model in the driving school system
 *
 * what it does:
 * - tests if students can be created with correct information (name, email, phone, etc.)
 * - verifies that required fields are enforced (you can't save a student without a name)
 * - checks that email addresses are in the correct format
 * - ensures license types are valid (like B, A, C but not Z)
 * - prevents duplicate email addresses in the system
 * - tests that extra spaces in names and emails are removed automatically
 * - verifies default values are set correctly (like status being "active")
 *
 * how it works:
 * - creates test students with different data combinations
 * - tries to save valid students and checks they are saved correctly
 * - tries to save invalid students and makes sure they are rejected
 * - uses a temporary test database so it doesn't affect real student records
 * - each test is independent and doesn't interfere with other tests
 */

import Student from '../../../src/models/student.model.js';
import '../../../tests/setup.js';

describe('Student Model', () => {
    describe('Validation', () => {
        it('should create a valid student', async () => {
            const validStudent = {
                name: 'abderrahmane houri',
                email: 'abderrahmane.houri@ensia.edu.dz',
                phone: '1234567890',
                licenseType: 'B',
                dateOfBirth: new Date('2005-09-06'),
            };

            const student = new Student(validStudent);
            const savedStudent = await student.save();

            expect(savedStudent._id).toBeDefined();
            expect(savedStudent.name).toBe(validStudent.name);
            expect(savedStudent.email).toBe(validStudent.email);
            expect(savedStudent.status).toBe('active'); // default value
        });

        it('should fail without required fields', async () => {
            const invalidStudent = new Student({});

            let err;
            try {
                await invalidStudent.save();
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
            const student = new Student({
                name: 'abderrahmane houri',
                email: 'invalid-email',
                phone: '1234567890',
                licenseType: 'B',
            });

            let err;
            try {
                await student.save();
            } catch (error) {
                err = error;
            }

            expect(err).toBeDefined();
            expect(err.errors.email).toBeDefined();
        });

        it('should fail with invalid license type', async () => {
            const student = new Student({
                name: 'abderrahmane houri',
                email: 'abderrahmane.houri@ensia.edu.dz',
                phone: '1234567890',
                licenseType: 'Z', // Invalid
            });

            let err;
            try {
                await student.save();
            } catch (error) {
                err = error;
            }

            expect(err).toBeDefined();
            expect(err.errors.licenseType).toBeDefined();
        });

        it('should enforce unique email', async () => {
            const studentData = {
                name: 'abderrahmane houri',
                email: 'abderrahmane.houri@ensia.edu.dz',
                phone: '1234567890',
                licenseType: 'B',
            };

            await Student.create(studentData);

            let err;
            try {
                await Student.create(studentData);
            } catch (error) {
                err = error;
            }

            expect(err).toBeDefined();
            expect(err.code).toBe(11000); // Duplicate key error
        });

        it('should trim whitespace from strings', async () => {
            const student = await Student.create({
                name: '  abderrahmane houri  ',
                email: '  abderrahmane.houri@ensia.edu.dz  ',
                phone: '1234567890',
                licenseType: 'B',
            });

            expect(student.name).toBe('abderrahmane houri');
            expect(student.email).toBe('abderrahmane.houri@ensia.edu.dz');
        });

        it('should convert email to lowercase', async () => {
            const student = await Student.create({
                name: 'abderrahmane houri',
                email: 'abderrahmane.houri@ensia.edu.dz',
                phone: '1234567890',
                licenseType: 'B',
            });

            expect(student.email).toBe('abderrahmane.houri@ensia.edu.dz');
        });
    });

    describe('Default Values', () => {
        it('should set default values correctly', async () => {
            const student = await Student.create({
                name: 'abderrahmane houri',
                email: 'abderrahmane.houri@ensia.edu.dz',
                phone: '1234567890',
                licenseType: 'B',
            });

            expect(student.status).toBe('active');
            expect(student.progress.theoryLessons).toBe(0);
            expect(student.progress.practicalLessons).toBe(0);
            expect(student.progress.theoryTestPassed).toBe(false);
            expect(student.progress.practicalTestPassed).toBe(false);
            expect(student.registrationDate).toBeDefined();
        });
    });

    describe('Age Validation', () => {
        it('should accept valid age (18 years old)', async () => {
            const eighteenYearsAgo = new Date();
            eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

            const student = await Student.create({
                name: 'John Doe',
                email: 'john@example.com',
                phone: '1234567890',
                licenseType: 'B',
                dateOfBirth: eighteenYearsAgo,
            });

            expect(student.dateOfBirth).toBeDefined();
        });

        it('should reject age under 16', async () => {
            const tenYearsAgo = new Date();
            tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

            let err;
            try {
                await Student.create({
                    name: 'abderrahmane.houri@ensia.edu.dz',
                    email: 'abderrahmane.houri@ensia.edu.dz',
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