import { Request, Response, NextFunction } from 'express';
import { UserRole, RolePermissions } from '../../domain/enums/UserRole';

/**
 * Middleware to ensure the user has the required permission
 * @param requiredPermission - The permission required to access the resource
 */
export function requirePermission(requiredPermission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userRole = req.user.role as UserRole;
    
    if (!userRole || !RolePermissions[userRole]?.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

/**
 * Middleware to ensure the user has the required role
 * @param roles - The roles allowed to access the resource
 */
export function requireRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userRole = req.user.role as UserRole;
    
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

/**
 * Middleware to ensure a user can only access their own resources
 * @param paramIdField - The request parameter containing the resource owner ID
 */
export function requireOwnership(paramIdField: string = 'userId') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const resourceOwnerId = parseInt(req.params[paramIdField], 10);
    const userId = req.user.id;

    // Admin can access any resource
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    if (isNaN(resourceOwnerId) || resourceOwnerId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}