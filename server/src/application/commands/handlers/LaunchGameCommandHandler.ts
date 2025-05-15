import { GameSandboxService } from '../../../infrastructure/services/GameSandboxService';
import { storage } from '../../../../storage';

/**
 * Command to launch a game in the sandbox
 */
export interface LaunchGameCommand {
  gameId: number;
  userId?: number; // Optional: if the user is logged in
}

/**
 * Response data from launching a game
 */
export interface LaunchGameResponse {
  sandboxId: string;
  sandboxUrl: string;
}

/**
 * Handler for the LaunchGameCommand
 * Following the Command pattern from CQRS
 */
export class LaunchGameCommandHandler {
  private readonly sandboxService: GameSandboxService;
  
  constructor(sandboxService: GameSandboxService) {
    this.sandboxService = sandboxService;
  }
  
  /**
   * Handles the command to launch a game in sandbox
   * @param command The LaunchGameCommand
   * @returns A promise with the LaunchGameResponse
   */
  async handle(command: LaunchGameCommand): Promise<LaunchGameResponse> {
    const { gameId, userId } = command;
    
    // Validation: Game exists
    const game = await storage.getGameById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    // Create sandbox for the game
    const sandboxId = await this.sandboxService.createSandbox(gameId);
    
    // Generate the sandbox URL
    const sandboxUrl = `/sandbox/${sandboxId}`;
    
    // Track game launch event (if user is logged in)
    if (userId) {
      // We could track analytics here, like:
      // await analyticsService.trackEvent('game_launch', { gameId, userId });
      console.log(`User ${userId} launched game ${gameId}`);
    }
    
    return {
      sandboxId,
      sandboxUrl
    };
  }
}