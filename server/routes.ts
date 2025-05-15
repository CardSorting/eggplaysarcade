import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  insertGameSchema, 
  insertRatingSchema, 
  insertUserSchema,
  SubmissionStatus,
  ReviewNote
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

// Import B2 Storage Services
import { GameSubmissionService } from './src/application/services/GameSubmissionService';
import { GetGameFileUrlHandler } from './src/application/queries/handlers/GetGameFileUrlHandler';

// Configure multer to store files in memory for B2 upload
const upload = multer({ 
  storage: multer.memoryStorage(),
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
  // Create the handlers for game file operations
  const getGameFileUrlHandler = new GetGameFileUrlHandler();
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
  
  // API endpoint for accessing files from B2 with presigned URLs
  apiRouter.get("/files/:type/:path", async (req: Request, res: Response) => {
    try {
      const { type, path } = req.params;
      const filePath = `${type}/${path}`;
      
      // Generate a pre-signed URL with the handler
      const url = await getGameFileUrlHandler.handle(filePath);
      
      // Return the URL
      res.json({ url });
    } catch (error) {
      console.error('Error generating file URL:', error);
      res.status(500).json({ message: 'Failed to generate file URL' });
    }
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
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      let games;
      if (categoryId) {
        games = await storage.getGamesByCategory(categoryId);
      } else if (search) {
        games = await storage.searchGames(search);
      } else if (userId) {
        // Filter games by user ID (for developer dashboard)
        games = await storage.getGamesByUserId(userId);
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
      const userId = req.user?.id || 0; // Default to 0 if not authenticated
      
      // Create a command and use the command handler
      const command: LaunchGameCommand = { gameId, userId };
      
      try {
        const result = await launchGameHandler.handle(command);
        
        // Return the sandbox information
        res.json({
          sandboxUrl: result,
          gameId,
          launchSessionId: `session-${Date.now()}`
        });
      } catch (handlerError) {
        console.error("Error in LaunchGameCommandHandler:", handlerError);
        res.status(500).json({ message: "Failed to launch game", error: handlerError.message });
      }
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
        
        // Use GameSubmissionService to handle the upload to B2
        const gameSubmissionService = new GameSubmissionService();
        
        // Prepare the game data
        const gameData = {
          ...req.body,
          categoryId: parseInt(req.body.categoryId),
        };
        
        // Submit the game (uploads files to B2 and creates game record)
        const game = await gameSubmissionService.submitGame(
          gameData, 
          gameFile, 
          thumbnail, 
          userId
        );
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
  
  // === Game Submissions Admin Routes ===
  // Get all game submissions
  adminRouter.get("/game-submissions", async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const developerId = req.query.developerId ? parseInt(req.query.developerId as string) : undefined;
      
      // TODO: Implement filtering in storage layer
      // For now, just return all submissions and filter here
      const submissions = await storage.getGameSubmissions();
      
      // Apply filters if needed
      let filteredSubmissions = submissions;
      if (status) {
        filteredSubmissions = filteredSubmissions.filter(sub => sub.status === status);
      }
      if (developerId) {
        filteredSubmissions = filteredSubmissions.filter(sub => sub.developerId === developerId);
      }
      
      res.json(filteredSubmissions);
    } catch (error) {
      console.error("Error fetching game submissions:", error);
      res.status(500).json({ message: "Failed to fetch game submissions" });
    }
  });
  
  // Get a specific submission
  adminRouter.get("/game-submissions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const submission = await storage.getGameSubmissionById(id);
      
      if (!submission) {
        return res.status(404).json({ message: "Game submission not found" });
      }
      
      res.json(submission);
    } catch (error) {
      console.error("Error fetching game submission:", error);
      res.status(500).json({ message: "Failed to fetch game submission" });
    }
  });
  
  // Start reviewing a game submission
  adminRouter.post("/game-submissions/:id/start-review", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const reviewerId = req.user?.id;
      
      // Update submission status
      const submission = await storage.updateGameSubmissionStatus(id, {
        status: SubmissionStatus.IN_REVIEW,
        reviewerId: reviewerId,
      });
      
      if (!submission) {
        return res.status(404).json({ message: "Game submission not found" });
      }
      
      res.json(submission);
    } catch (error) {
      console.error("Error starting review:", error);
      res.status(500).json({ message: "Failed to start review" });
    }
  });
  
  // Approve a game submission
  adminRouter.post("/game-submissions/:id/approve", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { notes } = req.body;
      
      // Update submission status
      const submission = await storage.updateGameSubmissionStatus(id, {
        status: SubmissionStatus.APPROVED,
        reviewedAt: new Date(),
      });
      
      if (!submission) {
        return res.status(404).json({ message: "Game submission not found" });
      }
      
      // Add review notes if provided
      if (notes) {
        const noteObj: ReviewNote = {
          id: `note-${Date.now()}`,
          content: notes,
          severity: 'info' as 'info' | 'warning' | 'critical',
          createdAt: new Date(),
          reviewerId: req.user?.id.toString() || '',
          isResolved: true,
          resolvedAt: new Date()
        };
        
        await storage.addGameSubmissionReviewNote(id, noteObj);
      }
      
      res.json(submission);
    } catch (error) {
      console.error("Error approving submission:", error);
      res.status(500).json({ message: "Failed to approve submission" });
    }
  });
  
  // Reject a game submission
  adminRouter.post("/game-submissions/:id/reject", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }
      
      // Update submission status
      const submission = await storage.updateGameSubmissionStatus(id, {
        status: SubmissionStatus.REJECTED,
        reviewedAt: new Date(),
        rejectionReason: reason
      });
      
      if (!submission) {
        return res.status(404).json({ message: "Game submission not found" });
      }
      
      // Add rejection reason as a review note
      const noteObj = {
        id: `note-${Date.now()}`,
        content: reason,
        severity: 'critical',
        createdAt: new Date(),
        reviewerId: req.user?.id.toString() || '',
        isResolved: false
      };
      
      await storage.addGameSubmissionReviewNote(id, noteObj);
      
      res.json(submission);
    } catch (error) {
      console.error("Error rejecting submission:", error);
      res.status(500).json({ message: "Failed to reject submission" });
    }
  });
  
  // Publish a game submission
  adminRouter.post("/game-submissions/:id/publish", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the submission
      const submission = await storage.getGameSubmissionById(id);
      if (!submission) {
        return res.status(404).json({ message: "Game submission not found" });
      }
      
      // Only approved submissions can be published
      if (submission.status !== SubmissionStatus.APPROVED) {
        return res.status(400).json({ 
          message: "Only approved submissions can be published",
          status: submission.status 
        });
      }
      
      // Update submission status
      const updatedSubmission = await storage.updateGameSubmissionStatus(id, {
        status: SubmissionStatus.PUBLISHED,
        publishedAt: new Date()
      });
      
      // Create or update the game in the games table
      const gameData = {
        title: submission.metadata.title,
        description: submission.metadata.description,
        instructions: submission.metadata.instructions || '',
        thumbnailUrl: submission.metadata.assets?.iconImageUrl || '',
        gameUrl: submission.bundleId || '',
        categoryId: parseInt(submission.metadata.categories?.[0] || '1'),
        tags: submission.metadata.tags || [],
        userId: submission.developerId,
      };
      
      // If it's an update to an existing game
      let game;
      if (submission.gameId) {
        // Update existing game
        game = await storage.updateGame(submission.gameId, gameData);
      } else {
        // Create new game
        game = await storage.createGame(gameData);
        
        // Update the submission with the game ID
        await storage.updateGameSubmission(id, { gameId: game.id });
      }
      
      res.json({ 
        submission: updatedSubmission,
        game
      });
    } catch (error) {
      console.error("Error publishing submission:", error);
      res.status(500).json({ message: "Failed to publish submission" });
    }
  });
  
  // === Wishlist Routes ===
  // Get user's wishlist - requires authentication
  apiRouter.get(
    "/wishlist",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({ message: "Authentication required" });
        }

        const wishlistGames = await storage.getWishlistItems(userId);
        res.json({ games: wishlistGames });
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ message: "Failed to fetch wishlist" });
      }
    }
  );

  // Add a game to wishlist - requires authentication
  apiRouter.post(
    "/wishlist",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const { gameId } = req.body;
        const userId = req.user?.id;
        
        if (!userId) {
          return res.status(401).json({ message: "Authentication required" });
        }
        
        if (!gameId) {
          return res.status(400).json({ message: "Game ID is required" });
        }

        // Check if game exists
        const game = await storage.getGameById(parseInt(gameId));
        if (!game) {
          return res.status(404).json({ message: "Game not found" });
        }

        // Check if already in wishlist
        const isInWishlist = await storage.isGameInWishlist(userId, parseInt(gameId));
        if (isInWishlist) {
          return res.status(200).json({ 
            message: "Game already in wishlist",
            inWishlist: true
          });
        }

        // Add to wishlist
        await storage.addToWishlist({
          userId,
          gameId: parseInt(gameId)
        });

        res.status(201).json({
          message: "Game added to wishlist",
          inWishlist: true
        });
      } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({ message: "Failed to add game to wishlist" });
      }
    }
  );

  // Remove a game from wishlist - requires authentication
  apiRouter.delete(
    "/wishlist/:gameId",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const gameId = parseInt(req.params.gameId);
        const userId = req.user?.id;
        
        if (!userId) {
          return res.status(401).json({ message: "Authentication required" });
        }

        // Check if in wishlist
        const isInWishlist = await storage.isGameInWishlist(userId, gameId);
        if (!isInWishlist) {
          return res.status(404).json({ message: "Game not in wishlist" });
        }

        // Remove from wishlist
        await storage.removeFromWishlist(userId, gameId);

        res.json({
          message: "Game removed from wishlist",
          inWishlist: false
        });
      } catch (error) {
        console.error("Error removing from wishlist:", error);
        res.status(500).json({ message: "Failed to remove game from wishlist" });
      }
    }
  );

  // Check if a game is in user's wishlist - requires authentication
  apiRouter.get(
    "/wishlist/check/:gameId",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const gameId = parseInt(req.params.gameId);
        const userId = req.user?.id;
        
        if (!userId) {
          return res.status(401).json({ message: "Authentication required" });
        }

        const isInWishlist = await storage.isGameInWishlist(userId, gameId);
        
        res.json({ inWishlist: isInWishlist });
      } catch (error) {
        console.error("Error checking wishlist:", error);
        res.status(500).json({ message: "Failed to check wishlist status" });
      }
    }
  );
  
  // Mount API router
  app.use("/api", apiRouter);
  
  // Serve uploaded files
  app.use("/uploads", express.static(uploadsDir));
  
  // Set up game sandbox service and proxy
  const sandboxService = new GameSandboxService();
  const sandboxProxy = new GameSandboxProxy(sandboxService);
  // Create a temporary repository implementation for the LaunchGameCommandHandler
  const gameRepository = {
    getById: async (id: any) => {
      const game = await storage.getGameById(typeof id === 'object' ? id.toString() : id);
      if (!game) return null;
      
      // Add placeholder files for demo (would be real files in production)
      return {
        ...game,
        files: {
          'index.html': '<h1>Game Content</h1><p>This is the game content</p>',
          'style.css': 'body { font-family: sans-serif; }',
          'script.js': 'console.log("Game loaded");'
        },
        entryPoint: 'index.html',
        resourceLimits: {
          memory: '128M',
          cpu: 0.5,
          timeout: 3600
        }
      };
    },
    incrementPlayerCount: async (id: any, increment: number) => {
      return storage.updateGamePlayers(typeof id === 'object' ? id.toString() : id, increment);
    }
  };
  
  const launchGameHandler = new LaunchGameCommandHandler(sandboxService, gameRepository);
  
  // Add sandbox middleware
  app.use("/sandbox", sandboxProxy.createSandboxMiddleware());
  
  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
