/**
 * Entry Point for Auth Service
 * Initializes server and database connection
 */

import app from './src/app.js';
import { connectDB } from './src/config/database.js';
import { config } from './src/config/env.js';

const PORT = config.port;

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✓ Database connected');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✓ ${config.serviceName} running on port ${PORT}`);
      console.log(`✓ Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('✗ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();

/**
 * Handle Graceful Shutdown
 */
process.on('SIGINT', () => {
  console.log('\n✓ Shutting down gracefully...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
