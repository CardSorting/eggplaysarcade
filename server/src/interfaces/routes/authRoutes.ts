import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { RegisterPlayerHandler } from '../../application/commands/handlers/RegisterPlayerHandler';
import { RegisterDeveloperHandler } from '../../application/commands/handlers/RegisterDeveloperHandler';
import { UserRepository } from '../../infrastructure/persistence/UserRepository';
import passport from 'passport';

/**
 * Setup authentication routes
 * Following Clean Architecture principles, route setup is isolated 
 * and depends on controllers which depend on use cases
 */
export function setupAuthRoutes(router: Router) {
  // Create dependencies
  const userRepository = new UserRepository();
  const registerPlayerHandler = new RegisterPlayerHandler(userRepository);
  const registerDeveloperHandler = new RegisterDeveloperHandler(userRepository);
  const authController = new AuthController(registerPlayerHandler, registerDeveloperHandler);
  
  // Player registration route
  router.post('/player/register', (req, res) => {
    authController.registerPlayer(req, res);
  });
  
  // Developer registration route
  router.post('/developer/register', (req, res) => {
    authController.registerDeveloper(req, res);
  });
  
  // Login route (common for all user types)
  router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: Express.User | false, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        const { password: _, ...userWithoutPassword } = user as any;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });
  
  // Logout route
  router.post('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  // Current user info route
  router.get('/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    // Don't return the password
    const { password: _, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
  
  return router;
}