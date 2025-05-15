/**
 * Command for launching a game in a sandboxed environment
 * 
 * Following the CQRS pattern, this command encapsulates
 * all data needed to launch a game.
 */
export interface LaunchGameCommand {
  /**
   * The ID of the game to launch
   */
  gameId: number | string;
  
  /**
   * The ID of the user launching the game
   */
  userId: number;
}