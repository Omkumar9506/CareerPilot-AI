import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

const PORT = env.PORT || 5000;
let server;

// Start server with database connection
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    console.log('⏳ Connecting to MongoDB...');
    await connectDB();

    // 2. Start HTTP server
    server = app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 CareerPilot AI Backend Server Running!`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
      console.log(`⚙️  Environment: ${env.NODE_ENV}`);
      console.log(`=========================================`);
    });
  } catch (err) {
    console.error('💥 Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown handler
const shutdown = async (signal) => {
  console.log(`\n👋 ${signal} received. Initiating graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log('💤 HTTP server closed.');
      await disconnectDB();
      console.log('✅ Graceful shutdown completed.');
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

// Listen for termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', async (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down gracefully...', err);
  if (server) {
    server.close(async () => {
      await disconnectDB();
      process.exit(1);
    });
  } else {
    await disconnectDB();
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', async (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down immediately...', err);
  await disconnectDB();
  process.exit(1);
});
