/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * DESIGN PATTERN: Middleware Pattern
 * 
 * This middleware checks if the authenticated user has the
 * required role to access a specific route.
 * 
 * USAGE:
 *   router.get('/admin/users', authMiddleware, roleMiddleware('admin'), handler);
 * 
 * The function returns a middleware function (closure pattern).
 * It must be used AFTER authMiddleware (which sets req.user).
 * 
 * @param {...string} allowedRoles - Roles that can access this route
 * @returns {Function} Express middleware function
 */

const { ErrorFactory } = require('../utils/factory');

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    // Make sure authMiddleware ran first
    if (!req.user) {
      return next(ErrorFactory.unauthorized('Authentication required'));
    }

    // Check if the user's role is in the allowed list
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ErrorFactory.forbidden(
          `Access denied. Required role: ${allowedRoles.join(' or ')}`
        )
      );
    }

    // User has the right role — continue
    next();
  };
};

module.exports = roleMiddleware;
