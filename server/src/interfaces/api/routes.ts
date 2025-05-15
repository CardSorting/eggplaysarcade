import { Express, Router } from "express";
import { DiContainer } from "../../infrastructure/config/DiContainer";
import { GameController } from "./controllers/GameController";
import { CategoryController } from "./controllers/CategoryController";
import { UserController } from "./controllers/UserController";

/**
 * Set up API routes
 * @param app Express application
 */
export function setupApiRoutes(app: Express): void {
  const apiRouter = Router();
  
  // Get instances from the DI container
  const container = DiContainer.getInstance();
  const gameController = container.get<GameController>("GameController");
  const categoryController = container.get<CategoryController>("CategoryController");
  const userController = container.get<UserController>("UserController");
  
  // Category routes
  apiRouter.get("/categories", (req, res) => categoryController.getAllCategories(req, res));
  apiRouter.get("/categories/:id", (req, res) => categoryController.getCategoryById(req, res));
  apiRouter.post("/categories", (req, res) => categoryController.createCategory(req, res));
  
  // Game routes
  apiRouter.get("/games", (req, res) => gameController.getAllGames(req, res));
  apiRouter.get("/games/:id", (req, res) => gameController.getGameById(req, res));
  apiRouter.post("/games", (req, res) => gameController.createGame(req, res));
  
  // Game play count update
  apiRouter.post("/games/:id/play", (req, res) => gameController.incrementPlayCount(req, res));
  
  // Game rating
  apiRouter.post("/games/:id/rate", (req, res) => gameController.rateGame(req, res));
  
  // User routes
  apiRouter.get("/users", (req, res) => userController.getAllUsers(req, res));
  apiRouter.get("/users/:id", (req, res) => userController.getUserById(req, res));
  apiRouter.post("/users/register", (req, res) => userController.registerUser(req, res));
  
  // Register the API router
  app.use("/api", apiRouter);
}