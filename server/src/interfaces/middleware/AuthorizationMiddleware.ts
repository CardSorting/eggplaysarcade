import { Request, Response, NextFunction } from "express";
import { UserRole } from "../../domain/enums/UserRole";
import { Permission } from "../../domain/valueObjects/Permission";
import { RolePermissionService } from "../../application/services/RolePermissionService";

/**
 * Middleware to ensure the user has the required permission
 * @param requiredPermission - The permission required to access the resource
 */
export function requirePermission(requiredPermission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = req.user;
    const rolePermissionService = new RolePermissionService();
    
    if (!rolePermissionService.hasPermission(user.role, requiredPermission)) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
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
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = req.user;
    
    if (!roles.includes(user.role as UserRole)) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
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
      return res.status(401).json({ message: "Unauthorized" });
    }

    const resourceUserId = parseInt(req.params[paramIdField]);
    const user = req.user;
    
    // Admin can access any user's resources
    if (user.role === UserRole.ADMIN) {
      return next();
    }
    
    if (user.id !== resourceUserId) {
      return res.status(403).json({ message: "Forbidden: You do not have permission to access this resource" });
    }

    next();
  };
}