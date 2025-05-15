import { Request, Response } from 'express';
import { DiContainer } from '../../../infrastructure/config/DiContainer';
import { GameDTO } from '../../../application/dto/GameDTO';
import { EntityId } from '../../../domain/value-objects/EntityId';
import { validateGame } from '../../validators/GameValidator';

/**
 * Game Controller following the Controller pattern
 * Handles HTTP requests related to games
 */
export class GameController {
  /**
   * Get all games with optional filtering by category or search term
   */
  async getGames(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const searchTerm = req.query.search as string | undefined;
      
      const container = DiContainer.getInstance();
      const getGamesQuery = container.getGamesQuery();
      
      const games = await getGamesQuery.execute({
        categoryId,
        searchTerm
      });
      
      res.json(GameDTO.fromEntities(games));
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch games' });
    }
  }

  /**
   * Get featured games
   */
  async getFeaturedGames(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      
      const container = DiContainer.getInstance();
      const getFeaturedGamesQuery = container.getFeaturedGamesQuery();
      
      const games = await getFeaturedGamesQuery.execute(limit);
      
      res.json(GameDTO.fromEntities(games));
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch featured games' });
    }
  }

  /**
   * Get popular games
   */
  async getPopularGames(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      
      const container = DiContainer.getInstance();
      const getPopularGamesQuery = container.getPopularGamesQuery();
      
      const games = await getPopularGamesQuery.execute(limit);
      
      res.json(GameDTO.fromEntities(games));
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch popular games' });
    }
  }

  /**
   * Get a game by ID
   */
  async getGameById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      const container = DiContainer.getInstance();
      const getGameByIdQuery = container.getGameByIdQuery();
      const updateGamePlayersCommand = container.getUpdateGamePlayersCommand();
      
      const game = await getGameByIdQuery.execute(id);
      
      if (!game) {
        res.status(404).json({ message: 'Game not found' });
        return;
      }
      
      // Increment players count
      await updateGamePlayersCommand.execute({ gameId: id, increment: 1 });
      
      res.json(GameDTO.fromEntity(game));
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch game' });
    }
  }

  /**
   * Create a new game
   */
  async createGame(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };
      
      if (!files.gameFile || !files.thumbnail) {
        res.status(400).json({ message: 'Both game file and thumbnail are required' });
        return;
      }
      
      const gameFile = files.gameFile[0];
      const thumbnail = files.thumbnail[0];
      
      // Parse tags if present
      let tags: string[] = [];
      if (req.body.tags && typeof req.body.tags === 'string') {
        tags = req.body.tags.split(',').map((tag: string) => tag.trim());
      }
      
      // Hard-coded userId for demo
      const userId = 1;
      
      // Prepare game data
      const gameData = {
        title: req.body.title,
        description: req.body.description,
        instructions: req.body.instructions,
        thumbnailUrl: `/uploads/thumbnails/${thumbnail.filename}`,
        gameUrl: `/uploads/games/${gameFile.filename}`,
        categoryId: parseInt(req.body.categoryId),
        userId,
        tags
      };
      
      // Validate game data
      const validationResult = validateGame(gameData);
      if (!validationResult.success) {
        res.status(400).json({ message: validationResult.message });
        return;
      }
      
      // Create game
      const container = DiContainer.getInstance();
      const createGameCommand = container.getCreateGameCommand();
      
      const game = await createGameCommand.execute(gameData);
      
      res.status(201).json(GameDTO.fromEntity(game));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message || 'Failed to create game' });
    }
  }

  /**
   * Rate a game
   */
  async rateGame(req: Request, res: Response): Promise<void> {
    try {
      const gameId = parseInt(req.params.id);
      const { value } = req.body;
      
      if (isNaN(value) || value < 1 || value > 5) {
        res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
        return;
      }
      
      // Hard-coded userId for demo
      const userId = 1;
      
      const container = DiContainer.getInstance();
      const createRatingCommand = container.getCreateRatingCommand();
      
      const rating = await createRatingCommand.execute({
        userId,
        gameId,
        value: parseInt(value)
      });
      
      res.status(201).json({ id: rating.id.value, value: rating.value });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to rate game' });
    }
  }
}