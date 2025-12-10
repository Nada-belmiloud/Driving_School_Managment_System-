// backend/src/scripts/seedAdmin.js
// Run this script to create the initial admin user
// Usage: node src/scripts/seedAdmin.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/admin.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/driving_school';

const seedAdmin = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: 'admin@drivingschool.com' });

        if (existingAdmin) {
            console.log('Admin user already exists');
            console.log('Email: admin@drivingschool.com');
        } else {
            // Create default admin
            const admin = await Admin.create({
                name: 'Admin',
                email: 'admin@drivingschool.com',
                password: 'admin123'  // Change this in production!
            });

            console.log('Admin user created successfully!');
            console.log('Email: admin@drivingschool.com');
            console.log('Password: admin123');
            console.log('');
            console.log('⚠️  IMPORTANT: Change the password after first login!');
        }

        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();

