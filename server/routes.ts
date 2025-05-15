import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  insertGameSchema, 
  insertRatingSchema, 
  insertUserSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create uploads/games directory if it doesn't exist
const gamesDir = path.join(uploadsDir, "games");
if (!fs.existsSync(gamesDir)) {
  fs.mkdirSync(gamesDir, { recursive: true });
}

// Create uploads/thumbnails directory if it doesn't exist
const thumbnailsDir = path.join(uploadsDir, "thumbnails");
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Configure multer for file uploads
const storage_config = multer.diskStorage({
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
  storage: storage_config,
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

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();
  
  // Get all categories
  apiRouter.get("/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  // Get all games
  apiRouter.get("/games", async (req: Request, res: Response) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const search = req.query.search as string | undefined;
      
      let games;
      if (categoryId) {
        games = await storage.getGamesByCategory(categoryId);
      } else if (search) {
        games = await storage.searchGames(search);
      } else {
        games = await storage.getGames();
      }
      
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });
  
  // Get featured games
  apiRouter.get("/games/featured", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const games = await storage.getFeaturedGames(limit);
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured games" });
    }
  });
  
  // Get popular games
  apiRouter.get("/games/popular", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const games = await storage.getPopularGames(limit);
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch popular games" });
    }
  });
  
  // Get a specific game
  apiRouter.get("/games/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const game = await storage.getGameById(id);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      await storage.updateGamePlayers(id, 1);
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });
  
  // Submit a new game
  apiRouter.post(
    "/games", 
    upload.fields([
      { name: 'gameFile', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 }
    ]),
    async (req: Request, res: Response) => {
      try {
        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };
        
        if (!files.gameFile || !files.thumbnail) {
          return res.status(400).json({ message: "Both game file and thumbnail are required" });
        }
        
        const gameFile = files.gameFile[0];
        const thumbnail = files.thumbnail[0];
        
        // Parse tags from string to array
        if (req.body.tags && typeof req.body.tags === 'string') {
          req.body.tags = req.body.tags.split(',').map((tag: string) => tag.trim());
        }
        
        // Hard-code userId since we don't have auth yet
        const userId = 1;
        
        // Check if user exists, if not create a dummy user
        const user = await storage.getUser(userId);
        if (!user) {
          await storage.createUser({
            username: 'demo_user',
            password: 'password' // In a real app, this would be hashed
          });
        }
        
        // Set the file paths for storage
        const gameData = {
          ...req.body,
          userId,
          categoryId: parseInt(req.body.categoryId),
          thumbnailUrl: `/uploads/thumbnails/${thumbnail.filename}`,
          gameUrl: `/uploads/games/${gameFile.filename}`,
        };
        
        // Validate the data
        const validatedData = insertGameSchema.parse(gameData);
        
        // Create the game
        const game = await storage.createGame(validatedData);
        res.status(201).json(game);
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        
        console.error(error);
        res.status(500).json({ message: "Failed to create game" });
      }
    }
  );
  
  // Rate a game
  apiRouter.post("/games/:id/rate", async (req: Request, res: Response) => {
    try {
      const gameId = parseInt(req.params.id);
      const { value } = req.body;
      
      // Hard-code userId since we don't have auth yet
      const userId = 1;
      
      // Check if game exists
      const game = await storage.getGameById(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // Validate rating data
      const validatedData = insertRatingSchema.parse({
        userId,
        gameId,
        value: parseInt(value)
      });
      
      // Create rating
      const rating = await storage.createRating(validatedData);
      res.status(201).json(rating);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to rate game" });
    }
  });
  
  // Register user
  apiRouter.post("/users/register", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Validate user data
      const validatedData = insertUserSchema.parse({ username, password });
      
      // Create user
      const user = await storage.createUser(validatedData);
      
      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  // Mount API router
  app.use("/api", apiRouter);
  
  // Serve uploaded files
  app.use("/uploads", express.static(uploadsDir));
  
  const httpServer = createServer(app);
  return httpServer;
}
