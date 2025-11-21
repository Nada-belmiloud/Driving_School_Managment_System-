// backend/tests/setup.js
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

// Setup before all tests
export const setupTestDB = async () => {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to the in-memory database
    await mongoose.connect(mongoUri);

    console.log('✅ Test database connected');
};

// Cleanup after all tests
export const teardownTestDB = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    if (mongoServer) {
        await mongoServer.stop();
    }

    console.log('✅ Test database disconnected');
};

// Clear all collections before each test
export const clearTestDB = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};

// Global test setup
beforeAll(async () => {
    await setupTestDB();
});

// Global test teardown
afterAll(async () => {
    await teardownTestDB();
});

// Clear database before each test
beforeEach(async () => {
    await clearTestDB();
});