import { UserEntity } from './UserEntity';
import { UserRole } from '../../shared/schema';

/**
 * PlayerEntity - Concrete implementation of UserEntity for Players
 * Contains player-specific business logic and validation
 */
export class PlayerEntity extends UserEntity {
  private favoriteGenres: string[] = [];
  private playedGames: number = 0;

  constructor(
    id: number | null,
    username: string,
    email: string | null,
    passwordHash: string,
    bio: string | null = null,
    avatarUrl: string | null = null,
    displayName: string | null = null,
    createdAt: Date = new Date(),
    lastLogin: Date | null = null,
    isVerified: boolean = false,
    favoriteGenres: string[] = []
  ) {
    super(
      id, 
      username, 
      email, 
      passwordHash,
      UserRole.PLAYER,
      bio,
      avatarUrl,
      displayName,
      createdAt,
      lastLogin,
      isVerified
    );
    
    this.favoriteGenres = favoriteGenres;
  }
  
  /**
   * Player-specific business logic for permissions
   */
  public canPerformAction(action: string): boolean {
    // Players can play games, rate games, etc.
    const playerAllowedActions = [
      'play_games',
      'rate_games',
      'manage_playlists',
      'edit_profile'
    ];
    
    return playerAllowedActions.includes(action);
  }
  
  /**
   * Record that a player has played a game
   */
  public recordGamePlayed(): void {
    this.playedGames++;
  }
  
  /**
   * Add a favorite genre
   */
  public addFavoriteGenre(genre: string): void {
    if (!this.favoriteGenres.includes(genre)) {
      this.favoriteGenres.push(genre);
    }
  }
  
  /**
   * Get the player's favorite genres
   */
  public getFavoriteGenres(): string[] {
    return [...this.favoriteGenres];
  }
  
  /**
   * Get number of games played
   */
  public getPlayedGamesCount(): number {
    return this.playedGames;
  }
  
  /**
   * Factory method to create a new PlayerEntity
   */
  public static create(
    username: string, 
    password: string,
    email: string | null = null,
    displayName: string | null = null
  ): PlayerEntity {
    return new PlayerEntity(
      null, // New player, no ID yet
      username,
      email,
      password, // This will be hashed in the application layer
      null, // No bio yet
      null, // No avatar yet
      displayName || username,
      new Date(),
      null,
      false
    );
  }
}