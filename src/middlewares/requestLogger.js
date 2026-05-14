/**
 * Request Logger Middleware
 * Logs incoming requests with method, path, and response time
 */

/**
 * Request Logger
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const { method, path, ip } = req;

  // Hook into response to log after sending
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // TODO: Implement proper logging (Winston, Pino, etc.)
    console.log(
      `[${new Date().toISOString()}] ${method} ${path} | ${statusCode} | ${duration}ms | ${ip}`
    );

    return originalJson.call(this, data);
  };

  next();
};

export default requestLogger;
