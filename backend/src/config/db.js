// backend/src/config/db.js
import mongoose from "mongoose";
import config from "./env.config.js";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongoUri, {
            // Mongoose 7+ no longer needs these options, but keeping for reference
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error(`❌ MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error('Please check your MONGO_URI in the .env file');
        process.exit(1);
    }
};

export default connectDB;