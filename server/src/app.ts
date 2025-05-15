import express, { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Server } from "http";
import { setupApiRoutes } from "./interfaces/api/routes.js";

// Get current file path and directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Application setup following the Clean Architecture pattern
 * This is the entry point for the application
 */
export async function createApp(): Promise<{ app: Express; server: Server }> {
  const app = express();

  // Set up middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  // Set up session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Set up uploads directory - use absolute path
  const uploadsPath = path.join(__dirname, "../../../uploads");
  app.use("/uploads", express.static(uploadsPath));
  console.log("Uploads directory set up at:", uploadsPath);

  // Set up API routes
  setupApiRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  });

  // Start the server
  const port = process.env.PORT || 5000;
  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  return { app, server };
}