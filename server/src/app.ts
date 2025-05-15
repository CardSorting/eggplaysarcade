import express, { Express, Request, Response, NextFunction } from 'express';
import { createServer, Server } from 'http';
import { setupApiRoutes } from './interfaces/api/routes';
import * as vite from '../vite';

/**
 * Application setup following the Clean Architecture pattern
 * This is the entry point for the application
 */
export async function createApp(): Promise<{ app: Express; server: Server }> {
  // Create express app
  const app = express();
  const server = createServer(app);
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // API routes
  const apiRouter = setupApiRoutes(app);
  app.use('/api', apiRouter);
  
  // Static files
  app.use('/uploads', express.static('uploads'));
  
  // Vite configuration for development
  if (process.env.NODE_ENV === 'development') {
    await vite.setupVite(app, server);
  } else {
    vite.serveStatic(app);
  }
  
  // Error handling
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      message: err.message || 'An unexpected error occurred',
      status: err.status || 500
    });
  });
  
  return { app, server };
}