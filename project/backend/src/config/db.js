// backend/src/config/db.js

/**
 * database connection configuration
 *
 * this file handles the connection between the application and MongoDB database.
 * MongoDB atlas or compass is where all the driving school data is stored (students, instructors, lessons ...).
 *
 * what this file does:
 * 1. connects to MongoDB using the connection string from environment variables
 * 2. print and logs success or error messages when connecting
 * 3. handles connection events (errors, disconnections)
 * 4. gracefully closes the database connection when the app shuts down
 *
 * the connectDB function should be called once when the server starts.
 */

import mongoose from "mongoose";
import { config } from "./env.config.js";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongoUri, {
            // mongoose 7+ no longer needs these options, but keeping for reference
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });

        console.log(`MongoDB connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);

        // handle connection events
        mongoose.connection.on('error', (err) => {
            console.error(`MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed by terminating the app');
            process.exit(0);
        });

    } catch (error) {
        console.error(`MongoDB connection Error: ${error.message}`);
        console.error('check the MONGO_URI in the .env file');
        process.exit(1);
    }
};

export default connectDB;