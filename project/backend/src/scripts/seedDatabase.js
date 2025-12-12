// backend/src/scripts/seedDatabase.js
// Run this script to initialize the database with all required collections and sample data
// Usage: node src/scripts/seedDatabase.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/admin.model.js';
import Candidate from '../models/candidate.model.js';
import Instructor from '../models/instructor.model.js';
import Vehicle from '../models/vehicle.model.js';
import Schedule from '../models/schedule.model.js';
import Payment from '../models/payment.model.js';
import Exam from '../models/exam.model.js';
import MaintenanceLog from '../models/maintenanceLog.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/driving_school_malak';

const seedDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        console.log('URI:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if database is already seeded
        const adminCount = await Admin.countDocuments();
        if (adminCount > 0) {
            console.log('\n⚠️  Database already has data. Skipping seed...');
            console.log('If you want to reseed, drop the database first.');
            await mongoose.connection.close();
            process.exit(0);
        }

        console.log('\n📦 Seeding database...\n');

        // 1. Create Admin
        console.log('Creating admin user...');
        const admin = await Admin.create({
            name: 'Manager',
            email: 'admin@drivingschool.com',
            password: 'admin123'
        });
        console.log('✅ Admin created: admin@drivingschool.com / admin123');

        // 2. Create Vehicles
        console.log('\nCreating vehicles...');
        const vehicles = await Vehicle.create([
            {
                brand: 'Toyota',
                model: 'Corolla',
                licensePlate: '12345-100-16',
                status: 'active'
            },
            {
                brand: 'Renault',
                model: 'Clio',
                licensePlate: '23456-200-16',
                status: 'active'
            },
            {
                brand: 'Peugeot',
                model: '208',
                licensePlate: '34567-300-16',
                status: 'active'
            }
        ]);
        console.log(`✅ Created ${vehicles.length} vehicles`);

        // 3. Create Instructors and assign vehicles
        console.log('\nCreating instructors...');
        const instructors = await Instructor.create([
            {
                name: 'Mohamed Benali',
                email: 'mohamed.benali@drivingschool.com',
                phone: '0555123456',
                address: 'Rue Didouche Mourad, Alger',
                assignedVehicle: vehicles[0]._id,
                status: 'active'
            },
            {
                name: 'Fatima Khelifi',
                email: 'fatima.khelifi@drivingschool.com',
                phone: '0555234567',
                address: 'Boulevard Mohamed V, Oran',
                assignedVehicle: vehicles[1]._id,
                status: 'active'
            },
            {
                name: 'Ahmed Saidi',
                email: 'ahmed.saidi@drivingschool.com',
                phone: '0555345678',
                address: 'Rue Larbi Ben Mhidi, Constantine',
                assignedVehicle: vehicles[2]._id,
                status: 'active'
            }
        ]);
        console.log(`✅ Created ${instructors.length} instructors`);

        // Update vehicles with assigned instructors
        await Vehicle.findByIdAndUpdate(vehicles[0]._id, { assignedInstructor: instructors[0]._id });
        await Vehicle.findByIdAndUpdate(vehicles[1]._id, { assignedInstructor: instructors[1]._id });
        await Vehicle.findByIdAndUpdate(vehicles[2]._id, { assignedInstructor: instructors[2]._id });
        console.log('✅ Vehicles assigned to instructors');

        // 4. Create Candidates
        console.log('\nCreating candidates...');
        const candidates = await Candidate.create([
            {
                name: 'Amina Khelifi',
                email: 'amina.khelifi@email.dz',
                phone: '0551234567',
                address: 'Cité 500 Logements, Alger',
                dateOfBirth: new Date('2000-05-15'),
                licenseType: 'B',
                status: 'active',
                progress: 'parking'
            },
            {
                name: 'Youcef Meziane',
                email: 'youcef.meziane@email.dz',
                phone: '0552345678',
                address: 'Hai Es-Salem, Oran',
                dateOfBirth: new Date('2002-08-22'),
                licenseType: 'B',
                status: 'active',
                progress: 'highway_code'
            },
            {
                name: 'Sarah Boudiaf',
                email: 'sarah.boudiaf@email.dz',
                phone: '0553456789',
                address: 'Rue Ali Mellah, Constantine',
                dateOfBirth: new Date('1998-12-10'),
                licenseType: 'A2',
                status: 'active',
                progress: 'driving'
            },
            {
                name: 'Karim Belkacem',
                email: 'karim.belkacem@email.dz',
                phone: '0554567890',
                address: 'Cité des Oliviers, Blida',
                dateOfBirth: new Date('2001-03-25'),
                licenseType: 'C1',
                status: 'active',
                progress: 'highway_code'
            }
        ]);
        console.log(`✅ Created ${candidates.length} candidates`);

        // 5. Create Payments
        console.log('\nCreating payments...');
        const payments = await Payment.create([
            {
                candidateId: candidates[0]._id,
                amount: 15000,
                status: 'paid',
                date: new Date('2024-09-15')
            },
            {
                candidateId: candidates[0]._id,
                amount: 10000,
                status: 'pending',
                date: new Date('2024-10-01')
            },
            {
                candidateId: candidates[1]._id,
                amount: 34000,
                status: 'paid',
                date: new Date('2024-10-01')
            },
            {
                candidateId: candidates[2]._id,
                amount: 20000,
                status: 'paid',
                date: new Date('2024-08-10')
            },
            {
                candidateId: candidates[2]._id,
                amount: 14000,
                status: 'pending',
                date: new Date('2024-09-10')
            },
            {
                candidateId: candidates[3]._id,
                amount: 17000,
                status: 'pending',
                date: new Date('2024-11-01')
            }
        ]);
        console.log(`✅ Created ${payments.length} payments`);

        // 6. Create Schedules (Lessons)
        console.log('\nCreating schedules...');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const schedules = await Schedule.create([
            {
                candidateId: candidates[0]._id,
                instructorId: instructors[0]._id,
                date: tomorrow,
                time: '09:00',
                status: 'scheduled',
                lessonType: 'parking'
            },
            {
                candidateId: candidates[0]._id,
                instructorId: instructors[0]._id,
                date: nextWeek,
                time: '10:00',
                status: 'scheduled',
                lessonType: 'parking'
            },
            {
                candidateId: candidates[1]._id,
                instructorId: instructors[1]._id,
                date: tomorrow,
                time: '14:00',
                status: 'scheduled',
                lessonType: 'highway_code'
            },
            {
                candidateId: candidates[2]._id,
                instructorId: instructors[2]._id,
                date: tomorrow,
                time: '16:00',
                status: 'scheduled',
                lessonType: 'driving'
            }
        ]);
        console.log(`✅ Created ${schedules.length} scheduled lessons`);

        // 7. Create Exams
        console.log('\nCreating exams...');
        const examDate = new Date(today);
        examDate.setDate(examDate.getDate() + 14);

        const exams = await Exam.create([
            {
                candidateId: candidates[0]._id,
                instructorId: instructors[0]._id,
                examType: 'highway_code',
                date: new Date('2024-10-15'),
                time: '09:00',
                status: 'passed',
                attemptNumber: 1,
                notes: 'Excellent performance'
            },
            {
                candidateId: candidates[0]._id,
                instructorId: instructors[0]._id,
                examType: 'parking',
                date: examDate,
                time: '10:00',
                status: 'scheduled',
                attemptNumber: 1
            },
            {
                candidateId: candidates[2]._id,
                instructorId: instructors[2]._id,
                examType: 'highway_code',
                date: new Date('2024-09-20'),
                time: '09:00',
                status: 'passed',
                attemptNumber: 1
            },
            {
                candidateId: candidates[2]._id,
                instructorId: instructors[2]._id,
                examType: 'parking',
                date: new Date('2024-10-10'),
                time: '10:00',
                status: 'passed',
                attemptNumber: 1
            },
            {
                candidateId: candidates[2]._id,
                instructorId: instructors[2]._id,
                examType: 'driving',
                date: examDate,
                time: '14:00',
                status: 'scheduled',
                attemptNumber: 1
            }
        ]);
        console.log(`✅ Created ${exams.length} exams`);

        // 8. Create Maintenance Logs
        console.log('\nCreating maintenance logs...');
        const maintenanceLogs = await MaintenanceLog.create([
            {
                vehicleId: vehicles[0]._id,
                date: new Date('2024-10-01'),
                type: 'oil-change',
                description: 'Regular oil change',
                cost: 5000,
                performedBy: 'Auto Service Alger'
            },
            {
                vehicleId: vehicles[0]._id,
                date: new Date('2024-11-15'),
                type: 'inspection',
                description: 'Monthly inspection',
                cost: 2000,
                performedBy: 'Auto Service Alger'
            },
            {
                vehicleId: vehicles[1]._id,
                date: new Date('2024-09-20'),
                type: 'tire-replacement',
                description: 'Replaced front tires',
                cost: 15000,
                performedBy: 'Pneu Plus Oran'
            },
            {
                vehicleId: vehicles[2]._id,
                date: new Date('2024-10-05'),
                type: 'brake-service',
                description: 'Brake pads replacement',
                cost: 8000,
                performedBy: 'Garage Central Constantine'
            }
        ]);
        console.log(`✅ Created ${maintenanceLogs.length} maintenance logs`);

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
        console.log('='.repeat(50));
        console.log('\nSummary:');
        console.log(`  - Admin: 1`);
        console.log(`  - Candidates: ${candidates.length}`);
        console.log(`  - Instructors: ${instructors.length}`);
        console.log(`  - Vehicles: ${vehicles.length}`);
        console.log(`  - Payments: ${payments.length}`);
        console.log(`  - Scheduled Lessons: ${schedules.length}`);
        console.log(`  - Exams: ${exams.length}`);
        console.log(`  - Maintenance Logs: ${maintenanceLogs.length}`);
        console.log('\n📌 Admin Login Credentials:');
        console.log('   Email: admin@drivingschool.com');
        console.log('   Password: admin123');
        console.log('\n⚠️  Remember to change the password in production!');

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error seeding database:', error.message);
        console.error(error);
        process.exit(1);
    }
};

seedDatabase();

