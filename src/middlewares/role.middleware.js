/**
 * Role-Based Authorization Middleware
 * Controls what users can do based on their role (admin, user, manager, etc.)
 * 
 * This middleware must run AFTER verifyAccessToken
 * It uses the user role that was decoded and attached to req.user by the auth middleware
 */

/**
 * Create an authorization middleware for specific roles
 * 
 * This is a "higher-order function" - it returns a middleware function
 * This pattern allows us to pass parameters (the allowed roles) to the middleware
 * 
 * Why this approach?
 * - Different routes need different permissions
 * - We want to specify allowed roles when defining the route
 * - Example: admin-only route vs manager-only route
 * 
 * Usage:
 * router.delete("/users/:id", verifyAccessToken, authorizeRoles("admin"), deleteUser)
 * router.get("/dashboard", verifyAccessToken, authorizeRoles("admin", "manager"), getDashboard)
 * 
 * @param {...string} allowedRoles - List of roles that are allowed to access this route
 * @returns {Function} Express middleware function
 */
export const authorizeRoles = (...allowedRoles) => {
  // Return the actual middleware function
  // This function receives the request, response, and next callback from Express
  return (req, res, next) => {
    try {
      // First check: does the request have user info?
      // This should always be true if verifyAccessToken ran before this middleware
      // But we check anyway for safety
      if (!req.user) {
        // This shouldn't happen if middleware order is correct, but if it does,
        // it means the authentication middleware didn't run or failed
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized: User information not found',
        });
      }

      // Get the user's role from the decoded JWT token
      // Remember: we never trust the client - we only trust what's in the JWT
      // (JWT is signed with our secret, so it can't be forged by the client)
      const userRole = req.user.role;

      // Check if the user's role is in the list of allowed roles
      // allowedRoles is an array like ["admin", "manager"]
      // We check if userRole is one of them
      const hasAccess = allowedRoles.includes(userRole);

      // If the user's role is NOT allowed, deny access
      // We return 403 Forbidden (not 401 - that's for authentication failures)
      // 403 means "I know who you are, but you don't have permission"
      if (!hasAccess) {
        return res.status(403).json({
          status: 'error',
          message: 'Forbidden: You do not have access to this resource',
        });
      }

      // User has the required role!
      // Allow the request to proceed to the route handler
      next();
    } catch (error) {
      // If something unexpected goes wrong, return a 500 error
      // We don't expose the exact error details to the client (security)
      return res.status(500).json({
        status: 'error',
        message: 'An error occurred while checking permissions',
      });
    }
  };
};

/**
 * Alternative: Check for single role (simpler syntax)
 * 
 * Usage:
 * router.delete("/users/:id", verifyAccessToken, requireRole("admin"), deleteUser)
 * 
 * This is just a convenience wrapper around authorizeRoles for when you only need one role
 */
export const requireRole = (role) => {
  // Simply delegate to authorizeRoles with one role
  return authorizeRoles(role);
};

export default authorizeRoles;
