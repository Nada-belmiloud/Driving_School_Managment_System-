// backend/src/scripts/migrateToAtlas.js
// This script helps migrate data from local MongoDB to MongoDB Atlas
// Usage: node src/scripts/migrateToAtlas.js

import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';

dotenv.config();

// Force DNS to use Google's DNS servers (helps with some network issues)
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Import all models
import Admin from '../models/admin.model.js';
import Candidate from '../models/candidate.model.js';
import Instructor from '../models/instructor.model.js';
import Vehicle from '../models/vehicle.model.js';
import Schedule from '../models/schedule.model.js';
import Exam from '../models/exam.model.js';
import Payment from '../models/payment.model.js';
import MaintenanceLog from '../models/maintenanceLog.model.js';

// Configuration - UPDATE THESE VALUES
const LOCAL_MONGO_URI = 'mongodb://127.0.0.1:27017/driving_school_malak';
const ATLAS_MONGO_URI = process.env.MONGO_URI; // Will be your Atlas URI

const migrateData = async () => {
    console.log('='.repeat(60));
    console.log('MongoDB Local to Atlas Migration Tool');
    console.log('='.repeat(60));

    // Check if Atlas URI is configured
    if (!ATLAS_MONGO_URI || ATLAS_MONGO_URI.includes('127.0.0.1') || ATLAS_MONGO_URI.includes('localhost')) {
        console.error('\n❌ ERROR: MONGO_URI in .env is still set to local MongoDB.');
        console.error('Please update MONGO_URI in .env to your MongoDB Atlas connection string first.');
        console.error('\nExample Atlas URI:');
        console.error('mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/driving_school_malak?retryWrites=true&w=majority');
        process.exit(1);
    }

    try {
        // Step 1: Connect to local MongoDB and fetch all data
        console.log('\n📥 Step 1: Connecting to LOCAL MongoDB...');
        await mongoose.connect(LOCAL_MONGO_URI);
        console.log('✅ Connected to local MongoDB');

        // Fetch all data from local database
        console.log('\n📊 Fetching data from local database...');

        const admins = await Admin.find({}).lean();
        const candidates = await Candidate.find({}).lean();
        const instructors = await Instructor.find({}).lean();
        const vehicles = await Vehicle.find({}).lean();
        const schedules = await Schedule.find({}).lean();
        const exams = await Exam.find({}).lean();
        const payments = await Payment.find({}).lean();
        const maintenanceLogs = await MaintenanceLog.find({}).lean();

        console.log(`   - Admins: ${admins.length}`);
        console.log(`   - Candidates: ${candidates.length}`);
        console.log(`   - Instructors: ${instructors.length}`);
        console.log(`   - Vehicles: ${vehicles.length}`);
        console.log(`   - Schedules: ${schedules.length}`);
        console.log(`   - Exams: ${exams.length}`);
        console.log(`   - Payments: ${payments.length}`);
        console.log(`   - Maintenance Logs: ${maintenanceLogs.length}`);

        // Disconnect from local
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from local MongoDB');

        // Step 2: Connect to Atlas and insert data
        console.log('\n📤 Step 2: Connecting to MongoDB Atlas...');
        console.log('   (This may take a moment, please wait...)');

        // Connect with extended timeout and DNS options
        await mongoose.connect(ATLAS_MONGO_URI, {
            serverSelectionTimeoutMS: 30000,  // 30 seconds timeout
            socketTimeoutMS: 45000,           // 45 seconds socket timeout
            family: 4,                        // Use IPv4, skip trying IPv6
            retryWrites: true,
            w: 'majority'
        });
        console.log('✅ Connected to MongoDB Atlas');

        console.log('\n📊 Migrating data to Atlas...');

        // Clear existing data in Atlas (optional - comment out if you want to keep existing data)
        console.log('   Clearing existing data in Atlas...');
        await Admin.deleteMany({});
        await Candidate.deleteMany({});
        await Instructor.deleteMany({});
        await Vehicle.deleteMany({});
        await Schedule.deleteMany({});
        await Exam.deleteMany({});
        await Payment.deleteMany({});
        await MaintenanceLog.deleteMany({});

        // Insert data with validateBeforeSave: false to handle already-hashed passwords
        if (admins.length > 0) {
            // For admins, we need to insert directly without triggering validation
            // because passwords are already hashed
            for (const admin of admins) {
                await Admin.collection.insertOne(admin);
            }
            console.log(`   ✅ Migrated ${admins.length} admins`);
        }
        if (candidates.length > 0) {
            await Candidate.collection.insertMany(candidates);
            console.log(`   ✅ Migrated ${candidates.length} candidates`);
        }
        if (instructors.length > 0) {
            await Instructor.collection.insertMany(instructors);
            console.log(`   ✅ Migrated ${instructors.length} instructors`);
        }
        if (vehicles.length > 0) {
            await Vehicle.collection.insertMany(vehicles);
            console.log(`   ✅ Migrated ${vehicles.length} vehicles`);
        }
        if (schedules.length > 0) {
            await Schedule.collection.insertMany(schedules);
            console.log(`   ✅ Migrated ${schedules.length} schedules`);
        }
        if (exams.length > 0) {
            await Exam.collection.insertMany(exams);
            console.log(`   ✅ Migrated ${exams.length} exams`);
        }
        if (payments.length > 0) {
            await Payment.collection.insertMany(payments);
            console.log(`   ✅ Migrated ${payments.length} payments`);
        }
        if (maintenanceLogs.length > 0) {
            await MaintenanceLog.collection.insertMany(maintenanceLogs);
            console.log(`   ✅ Migrated ${maintenanceLogs.length} maintenance logs`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(60));
        console.log('\nYour data has been migrated to MongoDB Atlas.');
        console.log('You can now start your server with the Atlas connection.');

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Migration Error:', error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.error('   Make sure your local MongoDB is running.');
        }
        if (error.message.includes('ETIMEOUT') || error.message.includes('queryTxt')) {
            console.error('\n   DNS Resolution Issue Detected!');
            console.error('   Try these solutions:');
            console.error('   1. Use the standard connection string instead of SRV');
            console.error('   2. Change your DNS to Google (8.8.8.8) or Cloudflare (1.1.1.1)');
            console.error('   3. Try connecting via mobile hotspot');
            console.error('\n   To get standard connection string:');
            console.error('   - Go to Atlas → Connect → Drivers');
            console.error('   - Uncheck "Use SRV connection string" if available');
        }
        if (error.message.includes('Authentication failed')) {
            console.error('   Check your Atlas username and password.');
        }
        process.exit(1);
    }
};

migrateData();

