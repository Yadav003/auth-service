/**
 * Global Error Handler Middleware
 * Catches all errors from controllers and services, and sends back a nice error response
 * This must be the LAST middleware registered in app.js
 */

/**
 * Error Handler
 * Takes any error that occurs in the app and formats it nicely for the client
 */
export const errorHandler = (err, req, res, next) => {
  // Default to 500 (server error) if we don't know what the status code should be
  const statusCode = err.statusCode || 500;
  
  // Get the error message, or use a generic one if not provided
  const message = err.message || 'Something went wrong on the server';

  // Log the error in the console so we can debug it later
  console.error(`[ERROR] ${statusCode} - ${message}`);

  // Send the error back to the client in a consistent format
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    // Only show stack trace in development mode (for debugging)
    // Never show it in production (security)
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
