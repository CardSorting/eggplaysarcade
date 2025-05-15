/**
 * Command to deploy a game to a sandbox
 * Following CQRS pattern for separating command and query responsibilities
 */
export interface DeploySandboxedGameCommand {
  sandboxId: string;
  gameId: string;
  gameBundleId: string;
}