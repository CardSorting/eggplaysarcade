import { Request, Response } from "express";
import { GameRepository } from "../../../domain/repositories/GameRepository";
import { CategoryRepository } from "../../../domain/repositories/CategoryRepository";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { RatingRepository } from "../../../domain/repositories/RatingRepository";
import { EntityId } from "../../../domain/value-objects/EntityId";
import { Game } from "../../../domain/entities/Game";
import { GameDTO } from "../../../application/dto/GameDTO";

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
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const search = req.query.search as string | undefined;
      
      let games: Game[];
      
      if (categoryId) {
        games = await this.gameRepository.findByCategory(new EntityId(categoryId));
      } else if (search) {
        games = await this.gameRepository.search(search);
      } else {
        games = await this.gameRepository.findAll();
      }
      
      const gameDTOs = games.map(game => GameDTO.fromEntity(game));
      res.status(200).json(gameDTOs);
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
      
      const game = await this.gameRepository.findById(new EntityId(id));
      
      if (!game) {
        res.status(404).json({ error: "Game not found" });
        return;
      }
      
      // Get category for the game
      const category = await this.categoryRepository.findById(game.categoryId);
      
      // Create DTO
      const gameDTO = GameDTO.fromEntity(game);
      
      // Add category if found
      if (category) {
        gameDTO.withCategory(category);
      }
      
      res.status(200).json(gameDTO);
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
      const { title, description, instructions, thumbnailUrl, gameUrl, categoryId, tags, userId } = req.body;
      
      if (!title || !description || !instructions || !thumbnailUrl || !gameUrl || !categoryId || !userId) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }
      
      // Verify category exists
      const category = await this.categoryRepository.findById(new EntityId(categoryId));
      if (!category) {
        res.status(400).json({ error: "Category not found" });
        return;
      }
      
      // Verify user exists
      const user = await this.userRepository.findById(new EntityId(userId));
      if (!user) {
        res.status(400).json({ error: "User not found" });
        return;
      }
      
      // Create the game entity
      const game = Game.create(
        title,
        description,
        instructions,
        thumbnailUrl,
        gameUrl,
        new EntityId(categoryId),
        new EntityId(userId),
        tags || null
      );
      
      // Save the game
      const savedGame = await this.gameRepository.save(game);
      
      // Return the DTO
      const gameDTO = GameDTO.fromEntity(savedGame);
      res.status(201).json(gameDTO);
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(500).json({ error: "Failed to create game" });
    }
  }

  /**
   * Increment play count for a game
   */
  async incrementPlayCount(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid game ID" });
        return;
      }
      
      const game = await this.gameRepository.findById(new EntityId(id));
      
      if (!game) {
        res.status(404).json({ error: "Game not found" });
        return;
      }
      
      // Increment the player count
      game.incrementPlayers(1);
      
      // Save the updated game
      const updatedGame = await this.gameRepository.save(game);
      
      // Return the DTO
      const gameDTO = GameDTO.fromEntity(updatedGame);
      res.status(200).json(gameDTO);
    } catch (error) {
      console.error("Error incrementing play count:", error);
      res.status(500).json({ error: "Failed to increment play count" });
    }
  }

  /**
   * Rate a game
   */
  async rateGame(req: Request, res: Response): Promise<void> {
    try {
      const gameId = parseInt(req.params.id);
      const { userId, value } = req.body;
      
      if (isNaN(gameId) || !userId || isNaN(value)) {
        res.status(400).json({ error: "Invalid request parameters" });
        return;
      }
      
      const game = await this.gameRepository.findById(new EntityId(gameId));
      
      if (!game) {
        res.status(404).json({ error: "Game not found" });
        return;
      }
      
      // Create rating
      const rating = await this.ratingRepository.createRating(
        new EntityId(userId),
        new EntityId(gameId),
        value
      );
      
      // Update game rating (this would ideally be calculated from all ratings)
      game.updateRating(value);
      
      // Save the updated game
      const updatedGame = await this.gameRepository.save(game);
      
      // Return the rating
      res.status(201).json({
        gameId,
        userId,
        value,
        id: rating.id?.value
      });
    } catch (error) {
      console.error("Error rating game:", error);
      res.status(500).json({ error: "Failed to rate game" });
    }
  }
}