import mongoose from 'mongoose';
import { env } from './env.js';

const connectionOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};

// Register connection lifecycle event listeners
mongoose.connection.on('connected', () => {
  console.log(`📦 MongoDB connected to host: ${mongoose.connection.host}, database: ${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected.');
});

/**
 * Connect to MongoDB with retry capability
 * @returns {Promise<typeof mongoose>}
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, connectionOptions);
    return conn;
  } catch (error) {
    console.error(`💥 Failed to connect to MongoDB: ${error.message}`);
    throw error;
  }
};

/**
 * Disconnect from MongoDB gracefully
 * @returns {Promise<void>}
 */
export const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('🛑 MongoDB connection closed gracefully.');
    }
  } catch (error) {
    console.error('Error during MongoDB disconnection:', error.message);
  }
};

/**
 * Get human-readable connection status
 * @returns {{ state: string, readyState: number, host: string|null, name: string|null }}
 */
export const getDBStatus = () => {
  const readyStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const readyState = mongoose.connection.readyState;
  return {
    state: readyStates[readyState] || 'unknown',
    readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
};
