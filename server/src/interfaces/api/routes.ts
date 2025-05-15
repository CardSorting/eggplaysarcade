import express, { Express, Router } from 'express';
import { Server } from 'http';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { GameController } from './controllers/GameController';
import { CategoryController } from './controllers/CategoryController';
import { UserController } from './controllers/UserController';

/**
 * API Routes configuration
 * This follows the Adapter pattern, connecting the HTTP interface to our application
 */
export function setupApiRoutes(app: Express): Router {
  // Create API router
  const apiRouter = express.Router();
  
  // Initialize controllers
  const gameController = new GameController();
  const categoryController = new CategoryController();
  const userController = new UserController();
  
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Create uploads/games directory if it doesn't exist
  const gamesDir = path.join(uploadsDir, 'games');
  if (!fs.existsSync(gamesDir)) {
    fs.mkdirSync(gamesDir, { recursive: true });
  }
  
  // Create uploads/thumbnails directory if it doesn't exist
  const thumbnailsDir = path.join(uploadsDir, 'thumbnails');
  if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir, { recursive: true });
  }
  
  // Configure multer for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const isGameFile = file.fieldname === 'gameFile';
      const destDir = isGameFile ? gamesDir : thumbnailsDir;
      cb(null, destDir);
    },
    filename: (req, file, cb) => {
      // Create a unique filename with original extension
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    }
  });
  
  const upload = multer({ 
    storage,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'gameFile') {
        // For game files allow HTML and ZIP
        if (file.mimetype === 'text/html' || file.mimetype === 'application/zip') {
          return cb(null, true);
        }
      } else if (file.fieldname === 'thumbnail') {
        // For thumbnails allow images
        if (file.mimetype.startsWith('image/')) {
          return cb(null, true);
        }
      }
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  });
  
  // Category routes
  apiRouter.get('/categories', (req, res) => categoryController.getCategories(req, res));
  
  // Game routes
  apiRouter.get('/games', (req, res) => gameController.getGames(req, res));
  apiRouter.get('/games/featured', (req, res) => gameController.getFeaturedGames(req, res));
  apiRouter.get('/games/popular', (req, res) => gameController.getPopularGames(req, res));
  apiRouter.get('/games/:id', (req, res) => gameController.getGameById(req, res));
  
  apiRouter.post(
    '/games',
    upload.fields([
      { name: 'gameFile', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 }
    ]),
    (req, res) => gameController.createGame(req, res)
  );
  
  apiRouter.post('/games/:id/rate', (req, res) => gameController.rateGame(req, res));
  
  // User routes
  apiRouter.post('/users/register', (req, res) => userController.registerUser(req, res));
  
  return apiRouter;
}