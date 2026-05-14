/**
 * Global Error Middleware
 * We keep the response small so clients do not learn more than they need to.
 */

export const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message =
    statusCode === 500 ? 'Something went wrong on the server' : err.message || 'Request failed';

  // Stack traces are useful while building, but they should stay out of production responses.
  const errorResponse = {
    status: 'error',
    statusCode,
    message,
  };

  if (process.env.NODE_ENV === 'development' && err.stack) {
    errorResponse.stack = err.stack;
  }

  console.error(`[ERROR] ${statusCode} - ${message}`);
  res.status(statusCode).json(errorResponse);
};

export default errorMiddleware;