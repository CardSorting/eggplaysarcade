import express, { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

export function setupAuthRoutes(): Router {
  const router = express.Router();
  const authController = new AuthController();

  // Player-specific auth routes
  router.post('/player/register', authController.registerPlayer);
  router.post('/player/login', authController.login);
  
  // Developer-specific auth routes
  router.post('/developer/register', authController.registerDeveloper);
  router.post('/developer/login', authController.login);
  
  // Common auth routes
  router.post('/logout', authController.logout);
  router.get('/user', authController.getCurrentUser);

  return router;
}