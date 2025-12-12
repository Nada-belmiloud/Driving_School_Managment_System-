// backend/src/scripts/updateAdminEmail.js
// Run this script to update the admin email to a real email address
// Usage: node src/scripts/updateAdminEmail.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/admin.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/driving_school_malak';

// Change this to your real email address
const NEW_ADMIN_EMAIL = 'houriabdo10@gmail.com';

const updateAdminEmail = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find the existing admin
        const admin = await Admin.findOne({ email: 'admin@drivingschool.com' });

        if (!admin) {
            // Check if admin with new email already exists
            const existingAdmin = await Admin.findOne({});
            if (existingAdmin) {
                console.log('Current admin email:', existingAdmin.email);
                if (existingAdmin.email !== NEW_ADMIN_EMAIL) {
                    existingAdmin.email = NEW_ADMIN_EMAIL;
                    await existingAdmin.save();
                    console.log('Admin email updated to:', NEW_ADMIN_EMAIL);
                } else {
                    console.log('Admin email is already set to:', NEW_ADMIN_EMAIL);
                }
            } else {
                console.log('No admin found. Creating new admin with email:', NEW_ADMIN_EMAIL);
                await Admin.create({
                    name: 'Admin',
                    email: NEW_ADMIN_EMAIL,
                    password: 'admin123'
                });
                console.log('New admin created!');
                console.log('Email:', NEW_ADMIN_EMAIL);
                console.log('Password: admin123');
            }
        } else {
            admin.email = NEW_ADMIN_EMAIL;
            await admin.save();
            console.log('Admin email updated successfully!');
            console.log('Old email: admin@drivingschool.com');
            console.log('New email:', NEW_ADMIN_EMAIL);
        }

        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error updating admin email:', error.message);
        process.exit(1);
    }
};

updateAdminEmail();

