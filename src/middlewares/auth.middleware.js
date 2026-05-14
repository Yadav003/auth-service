/**
 * Authentication Middleware
 * Protects routes by verifying the JWT access token
 * This middleware is used on all protected routes to ensure the user is authenticated
 */

import { verifyAccessToken as verifyTokenJWT } from '../utils/jwt.js';

/**
 * Middleware to verify access token
 * 
 * This middleware:
 * 1. Extracts the token from the Authorization header
 * 2. Verifies the token signature and expiry
 * 3. Attaches the user information to the request object
 * 4. Allows the request to proceed to the route handler
 * 
 * If anything goes wrong, it returns a 401 Unauthorized error
 * 
 * Usage:
 * router.get('/profile', verifyAccessToken, controllerFunction)
 */
export const verifyAccessToken = async (req, res, next) => {
  try {
    // Get the Authorization header from the request
    // The header looks like: "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    // If the user didn't send a token, we can't authenticate them
    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: No token provided',
      });
    }

    // Extract the token from the Authorization header
    // Format should be: "Bearer <token>"
    // We split by space and take the second part (the actual token)
    const parts = authHeader.split(' ');

    // Check if the Authorization header has the correct format
    // It should have exactly 2 parts: ["Bearer", "token"]
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: Invalid token format',
      });
    }

    // Get the actual token (the part after "Bearer ")
    const token = parts[1];

    // Verify the token signature and check if it's expired
    // This function will throw an error if the token is invalid or expired
    const decoded = await verifyTokenJWT(token);

    // If verification was successful, attach the user information to the request
    // This way, the route handler can access req.user to know who is making the request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    // Allow the request to proceed to the next middleware/route handler
    next();
  } catch (error) {
    // If the token is expired, send a specific error message
    // This way the client knows they need to refresh the token
    if (error.message === 'Access token has expired') {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: Token expired',
      });
    }

    // If the token is invalid for any other reason, send a generic error
    // We don't expose specific details to prevent leaking security information
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: Invalid token',
    });
  }
};

export default verifyAccessToken;
