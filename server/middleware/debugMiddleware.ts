import { Request, Response, NextFunction } from "express";

/**
 * Middleware to log authentication status and user details
 * This is useful for debugging authentication issues
 */
export function logAuthStatus(req: Request, res: Response, next: NextFunction) {
  console.log('Auth Debug Info:');
  console.log('- isAuthenticated:', req.isAuthenticated());
  
  if (req.isAuthenticated() && req.user) {
    console.log('- User:', {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
    });
  } else {
    console.log('- No user session');
  }
  
  console.log('- Session ID:', req.sessionID);
  
  next();
}