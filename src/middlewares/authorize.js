/**
 * Authorization Middleware (RBAC)
 * Checks if user has required roles for protected routes
 *
 * MIDDLEWARE PLACEHOLDER - Will be implemented in next phase
 */

/**
 * Check if user has required roles
 * @param {Array<string>} allowedRoles - List of allowed roles
 * @returns {Function} Express middleware function
 *
 * TODO: Extract user roles from request
 * TODO: Compare with allowed roles
 * TODO: Return 403 if user doesn't have required role
 *
 * Usage:
 * router.delete('/users/:id', verifyToken, authorize(['admin']), deleteUser)
 */
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // TODO: Implementation
      // Check if req.user.roles includes any of allowedRoles
      next();
    } catch (error) {
      res.status(403).json({ status: 'error', message: 'Forbidden' });
    }
  };
};

export default authorize;
