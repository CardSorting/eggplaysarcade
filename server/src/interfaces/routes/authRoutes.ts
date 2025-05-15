import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { RegisterPlayerHandler } from '../../application/commands/handlers/RegisterPlayerHandler';
import { RegisterDeveloperHandler } from '../../application/commands/handlers/RegisterDeveloperHandler';
import { UserRepository } from '../../infrastructure/persistence/UserRepository';
import { logAuthStatus } from '../../../middleware/debugMiddleware';

export function setupAuthRoutes(): Router {
  const router = Router();
  
  // Set up debug middleware in development
  if (process.env.NODE_ENV === 'development') {
    router.use(logAuthStatus);
  }
  
  // Create repository and handlers
  const userRepository = new UserRepository();
  const registerPlayerHandler = new RegisterPlayerHandler(userRepository);
  const registerDeveloperHandler = new RegisterDeveloperHandler(userRepository);
  
  // Create controller with injected dependencies
  const authController = new AuthController(
    registerPlayerHandler,
    registerDeveloperHandler
  );
  
  // Player registration
  router.post('/player/register', (req, res) => {
    authController.registerPlayer(req, res);
  });
  
  // Developer registration
  router.post('/developer/register', (req, res) => {
    authController.registerDeveloper(req, res);
  });
  
  return router;
}