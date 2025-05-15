import { Request, Response, NextFunction } from "express";
import { UserRole } from "../../domain/enums/UserRole";
import { Permission } from "../../domain/value-objects/Permission";
import { RolePermissionService } from "../../application/services/RolePermissionService";

/**
 * Middleware to ensure a user is authenticated before accessing a route
 */
export class AuthorizationMiddleware {
  private readonly rolePermissionService: RolePermissionService;

  constructor() {
    this.rolePermissionService = new RolePermissionService();
  }

  /**
   * Middleware to check if a user is authenticated
   */
  public requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "No user found in session" });
      return;
    }

    next();
  };

  /**
   * Middleware to check if a user has a specific role
   */
  public requireRole = (role: UserRole) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.isAuthenticated()) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      if (!req.user) {
        res.status(401).json({ message: "No user found in session" });
        return;
      }

      if (req.user.role !== role) {
        res.status(403).json({ 
          message: `Access denied. Required role: ${role}` 
        });
        return;
      }

      next();
    };
  };

  /**
   * Middleware to check if a user has a specific permission
   */
  public requirePermission = (permissionString: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.isAuthenticated()) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      if (!req.user) {
        res.status(401).json({ message: "No user found in session" });
        return;
      }

      const userRole = req.user.role as UserRole;
      
      if (!this.rolePermissionService.roleHasPermission(userRole, permissionString)) {
        res.status(403).json({ 
          message: `Access denied. Required permission: ${permissionString}` 
        });
        return;
      }

      next();
    };
  };
}