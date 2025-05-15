import { GameId } from '../../../domain/value-objects/GameId';
import { GameSandboxService } from '../../../infrastructure/services/GameSandboxService';
import { CommandHandler } from '../CommandHandler';
import { LaunchGameCommand } from '../LaunchGameCommand';

/**
 * CQRS Command Handler for launching games in secure sandboxed environments
 */
export class LaunchGameCommandHandler implements CommandHandler<LaunchGameCommand, string> {
  constructor(
    private readonly sandboxService: GameSandboxService,
    private readonly gameRepository: any // Replace with proper IGameRepository once implemented
  ) {}

  /**
   * Handles the LaunchGameCommand by spinning up a sandboxed environment
   * for the game and returning the URL to access it
   * 
   * @param command The LaunchGameCommand containing game and user info
   * @returns Promise with the URL to the sandboxed game
   */
  async handle(command: LaunchGameCommand): Promise<string> {
    const { gameId, userId } = command;
    
    // Convert the raw gameId to a domain GameId value object
    const gameIdObj = GameId.fromNumber(typeof gameId === 'string' ? parseInt(gameId) : gameId);
    
    try {
      // 1. Fetch the game from the repository
      const game = await this.gameRepository.getById(gameIdObj);
      if (!game) {
        throw new Error(`Game with ID ${gameId} not found`);
      }
      
      // 2. Update game player count
      await this.gameRepository.incrementPlayerCount(gameIdObj, 1);
      
      // 3. Create a sandbox for the game
      const sandboxUrl = await this.sandboxService.createSandbox({
        gameId: gameIdObj,
        userId,
        gameFiles: game.files,
        entryPoint: game.entryPoint || 'index.html',
        resourceLimits: {
          memory: game.resourceLimits?.memory || '128M',
          cpu: game.resourceLimits?.cpu || 0.5,
          timeout: game.resourceLimits?.timeout || 3600 // 1 hour in seconds
        }
      });
      
      // 4. Log the play event for analytics
      // logPlayEvent({ gameId, userId, timestamp: new Date() });
      
      return sandboxUrl;
    } catch (error) {
      console.error(`Error launching game: ${error}`);
      throw new Error(`Failed to launch game: ${error.message}`);
    }
  }
}