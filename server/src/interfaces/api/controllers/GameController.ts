import { Request, Response } from "express";
import { GameRepository } from "../../../domain/repositories/GameRepository";
import { CategoryRepository } from "../../../domain/repositories/CategoryRepository";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { RatingRepository } from "../../../domain/repositories/RatingRepository";
import { CreateGameCommand } from "../../../application/commands/CreateGameCommand";
import { GetGamesQuery } from "../../../application/queries/GetGamesQuery";
import { GetGameByIdQuery } from "../../../application/queries/GetGameByIdQuery";
import { EntityId } from "../../../domain/value-objects/EntityId";
import { GameDTO } from "../../../application/dto/GameDTO";
import { Game } from "../../../domain/entities/Game";
import { Rating } from "../../../domain/entities/Rating";

/**
 * Controller for game-related API endpoints
 * Following the Controller pattern from Clean Architecture
 */
export class GameController {
  private readonly gameRepository: GameRepository;
  private readonly categoryRepository: CategoryRepository;
  private readonly userRepository: UserRepository;
  private readonly ratingRepository: RatingRepository;

  constructor(
    gameRepository: GameRepository,
    categoryRepository: CategoryRepository,
    userRepository: UserRepository,
    ratingRepository: RatingRepository
  ) {
    this.gameRepository = gameRepository;
    this.categoryRepository = categoryRepository;
    this.userRepository = userRepository;
    this.ratingRepository = ratingRepository;
  }

  /**
   * Get all games
   */
  async getAllGames(req: Request, res: Response): Promise<void> {
    try {
      const query = new GetGamesQuery(this.gameRepository, this.categoryRepository);
      const games = await query.execute();
      res.status(200).json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ error: "Failed to fetch games" });
    }
  }

  /**
   * Get a game by ID
   */
  async getGameById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid game ID" });
        return;
      }
      
      const query = new GetGameByIdQuery(
        this.gameRepository,
        this.categoryRepository,
        this.userRepository,
        this.ratingRepository
      );
      
      const game = await query.execute(id);
      
      if (!game) {
        res.status(404).json({ error: "Game not found" });
        return;
      }
      
      res.status(200).json(game);
    } catch (error) {
      console.error("Error fetching game:", error);
      res.status(500).json({ error: "Failed to fetch game" });
    }
  }

  /**
   * Create a new game
   */
  async createGame(req: Request, res: Response): Promise<void> {
    try {
      const {
        title,
        description,
        instructions,
        thumbnailUrl,
        gameUrl,
        categoryId,
        userId,
        tags
      } = req.body;
      
      if (!title || !description || !gameUrl || !categoryId || !userId) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }
      
      const command = new CreateGameCommand(
        this.gameRepository,
        this.categoryRepository,
        this.userRepository
      );
      
      const game = await command.execute(
        title,
        description,
        instructions || "",
        thumbnailUrl || "",
        gameUrl,
        categoryId,
        userId,
        tags || []
      );
      
      res.status(201).json(game);
    } catch (error) {
      console.error("Error creating game:", error);
      
      if ((error as Error).message.includes("not found")) {
        res.status(404).json({ error: (error as Error).message });
      } else {
        res.status(500).json({ error: "Failed to create game" });
      }
    }
  }

  /**
   * Update game play count
   */
  async incrementPlayCount(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid game ID" });
        return;
      }
      
      // Get the game
      const game = await this.gameRepository.findById(new EntityId(id));
      
      if (!game) {
        res.status(404).json({ error: "Game not found" });
        return;
      }
      
      // Increment the play count
      game.incrementPlayCount();
      
      // Save the updated game
      await this.gameRepository.update(game);
      
      // Get the updated game with related entities
      const query = new GetGameByIdQuery(
        this.gameRepository,
        this.categoryRepository,
        this.userRepository,
        this.ratingRepository
      );
      
      const updatedGame = await query.execute(id);
      
      res.status(200).json(updatedGame);
    } catch (error) {
      console.error("Error updating play count:", error);
      res.status(500).json({ error: "Failed to update play count" });
    }
  }

  /**
   * Rate a game
   */
  async rateGame(req: Request, res: Response): Promise<void> {
    try {
      const gameId = parseInt(req.params.id);
      const { userId, stars, comment } = req.body;
      
      if (isNaN(gameId) || !userId || !stars || stars < 1 || stars > 5) {
        res.status(400).json({ error: "Invalid request data" });
        return;
      }
      
      // Get the game
      const game = await this.gameRepository.findById(new EntityId(gameId));
      
      if (!game) {
        res.status(404).json({ error: "Game not found" });
        return;
      }
      
      // Get the user
      const user = await this.userRepository.findById(new EntityId(userId));
      
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      
      // Create the rating
      const rating = Rating.create(
        new EntityId(gameId),
        new EntityId(userId),
        stars,
        comment || null
      );
      
      // Save the rating
      await this.ratingRepository.save(rating);
      
      // Add the rating to the game
      game.addRating(rating);
      
      // Save the updated game
      await this.gameRepository.update(game);
      
      // Get the updated game with related entities
      const query = new GetGameByIdQuery(
        this.gameRepository,
        this.categoryRepository,
        this.userRepository,
        this.ratingRepository
      );
      
      const updatedGame = await query.execute(gameId);
      
      res.status(200).json(updatedGame);
    } catch (error) {
      console.error("Error rating game:", error);
      res.status(500).json({ error: "Failed to rate game" });
    }
  }
}