import { GameRepository } from '../../domain/repositories/GameRepository';
import { Game } from '../../domain/entities/Game';
import { EntityId } from '../../domain/value-objects/EntityId';

export interface UpdateGamePlayersCommandParams {
  gameId: number;
  increment: number;
}

/**
 * Command for updating the player count of a game
 */
export class UpdateGamePlayersCommand {
  constructor(
    private readonly gameRepository: GameRepository
  ) {}

  async execute(params: UpdateGamePlayersCommandParams): Promise<Game | null> {
    const gameId = new EntityId(params.gameId);
    
    // Retrieve game
    const game = await this.gameRepository.findById(gameId);
    
    if (!game) {
      return null;
    }
    
    // Update player count
    game.incrementPlayers(params.increment);
    
    // Save to repository
    return await this.gameRepository.save(game);
  }
}