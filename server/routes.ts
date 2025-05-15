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
import { setupAuth } from "./auth";
import { requireAuth, requireRole, requirePermission } from "./middleware/authMiddleware";
import { logAuthStatus } from "./middleware/debugMiddleware";
import { UserRole } from "@/lib/types";
// Import sandbox services
import { GameSandboxProxy } from "./src/infrastructure/services/GameSandboxProxy";
import { GameSandboxService } from "./src/infrastructure/services/GameSandboxService";
import { 
  LaunchGameCommandHandler,
  LaunchGameCommand
} from "./src/application/commands/handlers/LaunchGameCommandHandler";
import passport from "passport";

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
  // Set up authentication
  setupAuth(app);
  
  // API routes
  const apiRouter = express.Router();
  
  // Apply debug middleware
  apiRouter.use(logAuthStatus);
  
  // === Authentication routes ===
  apiRouter.post("/register", async (req: Request, res: Response) => {
    try {
      const { username, password, email, role = UserRole.PLAYER } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Validate user data
      const validatedData = insertUserSchema.parse({ 
        username, 
        password, 
        role,
        email,
        avatarUrl: null,
        bio: null
      });
      
      // Create user
      const user = await storage.createUser(validatedData);
      
      // Login the user after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to log in after registration" });
        }
        // Don't return the password
        const { password: _, ...userWithoutPassword } = user;
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  apiRouter.post("/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
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
  
  apiRouter.post("/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  apiRouter.get("/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    // Don't return the password
    const { password: _, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
  
  // === Public routes ===
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
      
      // Don't increment view count here - only when actually viewing the game
      res.json({ game });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });
  
  // Get game reviews
  apiRouter.get("/games/:id/reviews", async (req: Request, res: Response) => {
    try {
      const gameId = parseInt(req.params.id);
      const ratings = await storage.getGameRatings(gameId);
      
      // Transform ratings into reviews with user data
      const reviews = await Promise.all(
        ratings.map(async (rating) => {
          const user = await storage.getUser(rating.userId);
          return {
            id: rating.id,
            gameId: rating.gameId,
            rating: rating.value,
            content: rating.comment || "",
            createdAt: rating.createdAt,
            helpfulCount: 0, // This would come from a separate table in a real app
            unhelpfulCount: 0,
            user: {
              id: user?.id,
              username: user?.username,
              avatarUrl: user?.avatarUrl
            }
          };
        })
      );
      
      res.json({ reviews });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch game reviews" });
    }
  });
  
  // Play game in sandbox using Command Handler pattern
  apiRouter.post("/games/:id/play", async (req: Request, res: Response) => {
    try {
      const gameId = parseInt(req.params.id);
      const userId = req.user?.id; // If using authentication
      
      // Create a command and use the command handler
      const command: LaunchGameCommand = { gameId, userId };
      const result = await launchGameHandler.handle(command);
      
      // Return the sandbox information
      res.json({
        ...result,
        gameId,
        launchSessionId: `session-${Date.now()}`
      });
    } catch (error) {
      console.error("Error launching game:", error);
      res.status(500).json({ message: "Failed to launch game" });
    }
  });
  
  // Like game
  apiRouter.post("/games/:id/like", async (req: Request, res: Response) => {
    try {
      const gameId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      // In a real implementation, this would store the like in a database table
      // For now, just verify the game exists
      const game = await storage.getGameById(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.json({ 
        success: true, 
        message: "Game liked successfully",
        isLiked: true
      });
    } catch (error) {
      console.error("Error liking game:", error);
      res.status(500).json({ message: "Failed to like game" });
    }
  });
  
  // === Protected routes ===
  // Submit a new game - requires authentication and 'submit_games' permission
  apiRouter.post(
    "/games", 
    requireAuth,
    requirePermission("submit_games"),
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
        
        // Use authenticated user's ID
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({ message: "Authentication required" });
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
  
  // Rate a game - requires authentication and 'rate_games' permission
  apiRouter.post(
    "/games/:id/rate", 
    requireAuth,
    requirePermission("rate_games"),
    async (req: Request, res: Response) => {
      try {
        const gameId = parseInt(req.params.id);
        const { value } = req.body;
        
        // Use authenticated user's ID
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({ message: "Authentication required" });
        }
        
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
    }
  );
  
  // === Admin routes ===
  const adminRouter = express.Router();
  
  // Only admin can access these routes
  apiRouter.use("/admin", requireAuth, requireRole(UserRole.ADMIN), adminRouter);
  
  // Admin dashboard data
  adminRouter.get("/dashboard", async (req, res) => {
    try {
      // In a real app, this would return dashboard metrics
      res.json({
        totalUsers: 0,
        totalGames: 0,
        totalCategories: 0,
        recentGames: []
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin dashboard data" });
    }
  });
  
  // Create a new category (admin only)
  adminRouter.post("/categories", async (req, res) => {
    try {
      const { name, icon } = req.body;
      
      if (!name || !icon) {
        return res.status(400).json({ message: "Name and icon are required" });
      }
      
      const category = await storage.createCategory({
        name,
        icon
      });
      
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  
  // Mount API router
  app.use("/api", apiRouter);
  
  // Serve uploaded files
  app.use("/uploads", express.static(uploadsDir));
  
  // Set up game sandbox service and proxy
  const sandboxService = new GameSandboxService();
  const sandboxProxy = new GameSandboxProxy(sandboxService);
  const launchGameHandler = new LaunchGameCommandHandler(sandboxService);
  
  // Add sandbox middleware
  app.use("/sandbox", sandboxProxy.createSandboxMiddleware());
  
  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
