// backend/tests/setup.js

/**
 * this file sets up the testing environment for all tests in this project
 *
 * what it does:
 * - creates a temporary in-memory mongodb database that runs only during tests
 * - this means tests don't affect your real database
 * - automatically connects to the test database before all tests start
 * - cleans up and disconnects after all tests finish
 * - clears all data between tests so each test starts fresh
 *
 * how it works:
 * - uses mongodb-memory-server to create a fake database in your computer's memory
 * - all test data is stored temporarily and disappears when tests finish
 * - each test file automatically uses this setup without needing to import it
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

// Setup before all tests
export const setupTestDB = async () => {
    // create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // connect to the in-memory database
    await mongoose.connect(mongoUri);

    console.log('test database connected');
};

// cleanup after all tests
export const teardownTestDB = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    if (mongoServer) {
        await mongoServer.stop();
    }

    console.log('Test database disconnected');
};

// clear all collections before each test
export const clearTestDB = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};

// global test setup
beforeAll(async () => {
    await setupTestDB();
});

// global test teardown
afterAll(async () => {
    await teardownTestDB();
});

// clear database before each test
beforeEach(async () => {
    await clearTestDB();
});