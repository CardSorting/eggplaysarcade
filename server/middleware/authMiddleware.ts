import { Request, Response, NextFunction } from "express";
import { UserRole } from "@/lib/types";
import { Permission, RolePermissions } from "@/lib/types";

/**
 * Check if a user is authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

/**
 * Check if a user has a specific role
 */
export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user?.role !== role) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${role}` 
      });
    }

    next();
  };
}

/**
 * Check if a user has a specific permission
 */
export function requirePermission(permissionName: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if the user's role has the required permission
    const userRole = req.user?.role as UserRole;
    const userPermissions = RolePermissions[userRole] || [];
    
    if (!userPermissions.includes(permissionName)) {
      return res.status(403).json({ 
        message: `Access denied. Required permission: ${permissionName}` 
      });
    }

    next();
  };
}