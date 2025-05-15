import { UserEntity } from './UserEntity';
import { UserRole } from '../../shared/schema';

/**
 * DeveloperEntity - Concrete implementation of UserEntity for Game Developers
 * Contains developer-specific business logic and validation
 */
export class DeveloperEntity extends UserEntity {
  private companyName: string | null;
  private portfolio: string | null;
  private publishedGames: number = 0;
  private developerVerified: boolean = false;

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
    companyName: string | null = null,
    portfolio: string | null = null,
    publishedGames: number = 0,
    developerVerified: boolean = false
  ) {
    super(
      id, 
      username, 
      email, 
      passwordHash,
      UserRole.GAME_DEVELOPER,
      bio,
      avatarUrl,
      displayName,
      createdAt,
      lastLogin,
      isVerified
    );
    
    this.companyName = companyName;
    this.portfolio = portfolio;
    this.publishedGames = publishedGames;
    this.developerVerified = developerVerified;
    
    this.validateDeveloper();
  }
  
  /**
   * Developer-specific validation
   */
  private validateDeveloper(): void {
    // Add developer-specific validation rules here
    if (this.developerVerified && !this.email) {
      throw new Error('Verified developers must have an email address');
    }
  }
  
  /**
   * Developer-specific business logic for permissions
   */
  public canPerformAction(action: string): boolean {
    // Developers can manage their own games, view analytics, etc.
    const developerAllowedActions = [
      'manage_own_games',
      'view_own_analytics',
      'submit_games',
      'edit_profile',
      'play_games',
      'rate_games',
      'manage_playlists'
    ];
    
    return developerAllowedActions.includes(action);
  }
  
  /**
   * Record a new published game
   */
  public recordPublishedGame(): void {
    this.publishedGames++;
  }
  
  /**
   * Get company name
   */
  public getCompanyName(): string | null {
    return this.companyName;
  }
  
  /**
   * Set company name
   */
  public setCompanyName(companyName: string | null): void {
    this.companyName = companyName;
  }
  
  /**
   * Get portfolio URL
   */
  public getPortfolio(): string | null {
    return this.portfolio;
  }
  
  /**
   * Set portfolio URL
   */
  public setPortfolio(portfolio: string | null): void {
    this.portfolio = portfolio;
  }
  
  /**
   * Get number of published games
   */
  public getPublishedGamesCount(): number {
    return this.publishedGames;
  }
  
  /**
   * Is the developer verified (for higher visibility, etc.)
   */
  public isDeveloperVerified(): boolean {
    return this.developerVerified;
  }
  
  /**
   * Verify the developer (e.g., after admin approval)
   */
  public verifyDeveloper(): void {
    if (!this.email) {
      throw new Error('Cannot verify developer without an email address');
    }
    
    this.developerVerified = true;
  }
  
  /**
   * Factory method to create a new DeveloperEntity
   */
  public static create(
    username: string, 
    password: string,
    email: string | null = null,
    companyName: string | null = null,
    portfolio: string | null = null,
    displayName: string | null = null
  ): DeveloperEntity {
    return new DeveloperEntity(
      null, // New developer, no ID yet
      username,
      email,
      password, // This will be hashed in the application layer
      null, // No bio yet
      null, // No avatar yet
      displayName || companyName || username,
      new Date(),
      null,
      false,
      companyName,
      portfolio
    );
  }
}