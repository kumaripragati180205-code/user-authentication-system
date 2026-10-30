/**
 * Role-Based Access Control (RBAC) middleware.
 * Verifies whether the authenticated user holds one of the required roles.
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHENTICATED',
        message: 'Authentication required before role check.'
      });
    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `Forbidden: This resource requires one of [${allowedRoles.join(', ')}] roles, but your current role is '${userRole}'.`,
        requiredRoles: allowedRoles,
        userRole: userRole
      });
    }

    next();
  };
}

