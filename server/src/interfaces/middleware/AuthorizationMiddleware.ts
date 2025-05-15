import { Request, Response, NextFunction } from "express";
import { UserRole } from "../../domain/enums/UserRole";
import { Permission } from "../../domain/value-objects/Permission";
import { RolePermissionService } from "../../application/services/RolePermissionService";

/**
 * Middleware for role and permission-based authorization
 * Following Clean Architecture principles for interface adapters
 */
export class AuthorizationMiddleware {
  private rolePermissionService: RolePermissionService;

  constructor(rolePermissionService: RolePermissionService) {
    this.rolePermissionService = rolePermissionService;
  }

  /**
   * Middleware to restrict access to specific roles
   */
  public restrictToRoles(allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Check if user has one of the allowed roles
      const userRole = req.user?.role as UserRole;
      
      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          message: 'Access denied: insufficient permissions' 
        });
      }

      next();
    };
  }

  /**
   * Middleware to restrict access based on permissions
   */
  public requirePermission(requiredPermission: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Check if user role has the required permission
      const userRole = req.user?.role as UserRole;
      
      if (!userRole || !this.rolePermissionService.roleHasPermission(userRole, requiredPermission)) {
        return res.status(403).json({ 
          message: `Access denied: missing required permission: ${requiredPermission}` 
        });
      }

      next();
    };
  }

  /**
   * Middleware to restrict access to resource owners or admins
   */
  public restrictToOwnerOrAdmin(getUserIdFromParams: (req: Request) => number) {
    return (req: Request, res: Response, next: NextFunction) => {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userId = req.user?.id;
      const resourceOwnerId = getUserIdFromParams(req);
      const userRole = req.user?.role as UserRole;

      // Allow access if user is admin or the resource owner
      if (userRole === UserRole.ADMIN || userId === resourceOwnerId) {
        next();
      } else {
        return res.status(403).json({ 
          message: 'Access denied: you can only access your own resources' 
        });
      }
    };
  }
}