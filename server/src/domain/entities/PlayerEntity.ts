import { UserEntity } from './UserEntity';
import { UserRole } from '../../../../shared/schema';

/**
 * Player Entity
 * Extends the base UserEntity with player-specific functionality
 * This represents a player user in the domain model
 */
export class PlayerEntity extends UserEntity {
  constructor(
    username: string,
    passwordHash: string,
    options: {
      id?: number;
      email?: string | null;
      avatarUrl?: string | null;
      bio?: string | null;
      displayName?: string | null;
      createdAt?: Date;
      lastLogin?: Date | null;
      isVerified?: boolean | null;
    } = {}
  ) {
    super(username, passwordHash, {
      ...options,
      role: UserRole.PLAYER
    });
  }

  // Player-specific methods
  public canRateGames(): boolean {
    return this.isUserVerified() === true;
  }

  public canSubmitReviews(): boolean {
    return this.isUserVerified() === true;
  }
}