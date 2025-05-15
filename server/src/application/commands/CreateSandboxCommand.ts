import { SecurityLevel } from '../../domain/value-objects/SecurityLevel';

/**
 * Command to create a new sandbox for a game
 * Following CQRS pattern for separating command and query responsibilities
 */
export interface CreateSandboxCommand {
  gameId: string;
  gameBundleId: string;
  securityLevel: SecurityLevel;
  expiresInHours?: number;
  containerImage?: string;
}