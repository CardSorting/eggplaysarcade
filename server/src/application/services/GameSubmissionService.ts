import { GameFileFactory } from '../factories/GameFileFactory';
import { storage } from '../../../storage';
import { InsertGame, Game } from '@shared/schema';
import { File } from '../../domain/entities/File';

/**
 * Game Submission Service
 * Coordinates the game submission process, integrating storage and file uploads
 * Following the Application Service pattern from DDD
 */
export class GameSubmissionService {
  private gameFileFactory: GameFileFactory;
  
  constructor() {
    this.gameFileFactory = GameFileFactory.getInstance();
  }
  
  /**
   * Submit a new game
   * @param gameData Game data without file URLs
   * @param gameFile Game file (HTML or ZIP)
   * @param thumbnailFile Thumbnail image file
   * @param userId User ID of the submitter
   * @returns The created game
   */
  async submitGame(
    gameData: Omit<InsertGame, 'thumbnailUrl' | 'gameUrl'>,
    gameFile: Express.Multer.File,
    thumbnailFile: Express.Multer.File,
    userId: number
  ): Promise<Game> {
    try {
      // Upload the game file to B2
      const gameFileBuffer = gameFile.buffer;
      const uploadedGameFile = await this.gameFileFactory.uploadGameFile(
        gameFileBuffer,
        gameFile.originalname,
        gameFile.mimetype,
        gameFile.size,
        userId
      );
      
      // Upload the thumbnail to B2
      const thumbnailBuffer = thumbnailFile.buffer;
      const uploadedThumbnail = await this.gameFileFactory.uploadThumbnail(
        thumbnailBuffer,
        thumbnailFile.originalname,
        thumbnailFile.mimetype,
        thumbnailFile.size,
        userId
      );
      
      // Create the game with the file URLs
      const fullGameData: InsertGame = {
        ...gameData,
        userId,
        thumbnailUrl: uploadedThumbnail.url,
        gameUrl: uploadedGameFile.url
      };
      
      // Store the game in the database
      const game = await storage.createGame(fullGameData);
      
      return game;
    } catch (error) {
      console.error('Error submitting game:', error);
      throw new Error(`Failed to submit game: ${(error as Error).message}`);
    }
  }
}