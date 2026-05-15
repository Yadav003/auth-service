/**
 * Express Application Setup
 * Initializes middleware, routes, and error handling
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config/env.js';
import { apiLimiter } from './middlewares/rateLimit.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { requestLogger } from './middlewares/requestLogger.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

const app = express();

// Trust the first proxy hop so IP-based security checks stay accurate in production.
app.set('trust proxy', 1);

/**
 * Security Middleware
 */
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  })
);

// Keep the whole service from being hammered with noisy traffic.
app.use(apiLimiter);

/**
 * Body Parser Middleware
 */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

/**
 * Request Logging Middleware
 */
app.use(requestLogger);

/**
 * Health Check Endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: config.serviceName,
    timestamp: new Date().toISOString(),
  });
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use(`/api/${config.apiVersion}/auth`, authRoutes);
app.use(`/api/${config.apiVersion}/admin`, adminRoutes);

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl,
  });
});

/**
 * Global Error Handler (must be last)
 */
app.use(errorMiddleware);

export default app;
