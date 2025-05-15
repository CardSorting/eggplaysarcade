import { UserRole } from "../../../../shared/schema";
import { UserEntity } from "./UserEntity";

/**
 * Player Entity - represents a user who can play and rate games
 * Domain logic specific to players is implemented here
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
    super(username, passwordHash, UserRole.PLAYER, options);
  }

  /**
   * Player-specific business logic
   */
  
  // Players cannot submit games
  public canSubmitGames(): boolean {
    return false;
  }
  
  // Players can rate games
  public canRateGames(): boolean {
    return true;
  }
  
  // Players can edit their own profiles
  public canEditProfile(): boolean {
    return true;
  }
  
  // Player-specific methods
  public canAddToWishlist(): boolean {
    return true;
  }
  
  // Players can track game progress
  public canTrackProgress(): boolean {
    return true;
  }
}