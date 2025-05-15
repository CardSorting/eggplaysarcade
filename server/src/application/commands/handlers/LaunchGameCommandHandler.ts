import { v4 as uuidv4 } from 'uuid';
import { GameId } from '../../../domain/value-objects/GameId';
import { VersionNumber } from '../../../domain/value-objects/VersionNumber';
import { GameSandboxService } from '../../../infrastructure/services/GameSandboxService';
import { GameStatus } from '../../../domain/entities/Game';

// Command DTO
export interface LaunchGameCommand {
  gameId: string;
  version?: string;
  userId?: string;
}

// Result DTO
export interface LaunchGameResult {
  sandboxId: string;
  sandboxUrl: string;
  gameId: string;
  version: string;
  launchSessionId: string;
}

/**
 * Command handler for launching a game in a sandboxed environment
 * Following the CQRS pattern, this handles the command to start a game session
 */
export class LaunchGameCommandHandler {
  constructor(
    private readonly gameRepository: any, // Should be IGameRepository
    private readonly sandboxService: GameSandboxService,
    private readonly gameLaunchLogger: any, // Should be IGameLaunchLogger
    private readonly userPermissionService: any // Should be IUserPermissionService
  ) {}
  
  /**
   * Execute the command to launch a game
   */
  async execute(command: LaunchGameCommand): Promise<LaunchGameResult> {
    try {
      const { gameId, version, userId } = command;
      
      // Validate game ID
      if (!GameId.isValid(gameId)) {
        throw new Error(`Invalid game ID format: ${gameId}`);
      }
      
      // Get game from repository
      const game = await this.gameRepository.getById(gameId);
      if (!game) {
        throw new Error(`Game not found: ${gameId}`);
      }
      
      // Check if game is published
      if (game.status !== GameStatus.PUBLISHED) {
        // Check if user has permission to access unpublished game
        // (e.g., if they're the developer or an admin)
        if (userId) {
          const canAccess = await this.userPermissionService.canAccessGame(userId, gameId);
          if (!canAccess) {
            throw new Error('Game is not published and you do not have access to it');
          }
        } else {
          throw new Error('Game is not published');
        }
      }
      
      // Determine which version to launch
      const versionToLaunch = version || game.currentVersionNumber.toString();
      
      // Check if specified version exists
      if (version && !await this.gameRepository.hasVersion(gameId, version)) {
        throw new Error(`Version ${version} not found for game ${gameId}`);
      }
      
      // Get bundle location for the version
      const bundleLocation = await this.gameRepository.getBundleLocation(gameId, versionToLaunch);
      if (!bundleLocation) {
        throw new Error(`Bundle not found for game ${gameId} version ${versionToLaunch}`);
      }
      
      // Configure sandbox
      const sandboxConfig = {
        allowExternalRequests: game.metadata.externalRequestsAllowed || false,
        allowedDomains: game.metadata.allowedDomains || [],
        environmentVariables: {
          GAME_ID: gameId,
          GAME_VERSION: versionToLaunch,
          SESSION_ID: uuidv4()
        }
      };
      
      // Launch game in sandbox
      const sandbox = await this.sandboxService.createSandbox(
        gameId,
        versionToLaunch,
        bundleLocation,
        sandboxConfig
      );
      
      // Generate a unique launch session ID
      const launchSessionId = uuidv4();
      
      // Log the game launch
      await this.gameLaunchLogger.logLaunch({
        gameId,
        version: versionToLaunch,
        sandboxId: sandbox.id,
        userId: userId || 'anonymous',
        timestamp: new Date(),
        sessionId: launchSessionId
      });
      
      // Record play in game entity (if not the developer testing)
      if (userId !== game.developerId) {
        await this.gameRepository.recordPlay(gameId);
      }
      
      return {
        sandboxId: sandbox.id,
        sandboxUrl: sandbox.url,
        gameId,
        version: versionToLaunch,
        launchSessionId
      };
    } catch (error) {
      // Log error
      console.error(`Error launching game:`, error);
      
      // Rethrow with more user-friendly message
      if (error instanceof Error) {
        throw new Error(`Failed to launch game: ${error.message}`);
      } else {
        throw new Error(`Failed to launch game: Unknown error`);
      }
    }
  }
}