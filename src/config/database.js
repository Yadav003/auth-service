/**
 * MongoDB Database Connection
 * Establishes connection to MongoDB using Mongoose
 */

import mongoose from 'mongoose';
import { config } from './env.js';

/**
 * Connect to MongoDB
 * @async
 * @throws {Error} If connection fails
 */
export const connectDB = async () => {
  try {
    const mongoUri = config.mongodb.uri;

    const options = {
    
      // Add any additional mongoose options here
    };

    // Add authentication if credentials provided
    if (config.mongodb.user && config.mongodb.password) {
      options.authSource = 'admin';
    }

    await mongoose.connect(mongoUri, options);

    console.log(`Connected to MongoDB: ${mongoUri}`);

    /**
     * Handle connection events
     */
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 * @async
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Failed to disconnect from MongoDB:', error.message);
    throw error;
  }
};

export default mongoose;
