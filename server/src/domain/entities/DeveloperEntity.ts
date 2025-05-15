import { UserEntity } from './UserEntity';
import { UserRole } from '../../../../shared/schema';

/**
 * Developer Entity
 * Extends the base UserEntity with developer-specific attributes and behavior
 * This represents a game developer user in the domain model
 */
export class DeveloperEntity extends UserEntity {
  private companyName: string | null;
  private portfolio: string | null;

  constructor(
    username: string,
    passwordHash: string,
    options: {
      id?: number;
      email?: string | null;
      avatarUrl?: string | null;
      bio?: string | null;
      displayName?: string | null;
      companyName?: string | null;
      portfolio?: string | null;
      createdAt?: Date;
      lastLogin?: Date | null;
      isVerified?: boolean | null;
    } = {}
  ) {
    super(username, passwordHash, {
      ...options,
      role: UserRole.GAME_DEVELOPER
    });
    
    this.companyName = options.companyName || null;
    this.portfolio = options.portfolio || null;
  }

  // Getters for developer-specific fields
  public getCompanyName(): string | null {
    return this.companyName;
  }

  public getPortfolio(): string | null {
    return this.portfolio;
  }

  // Setters for developer-specific fields
  public setCompanyName(companyName: string | null): void {
    this.companyName = companyName;
  }

  public setPortfolio(portfolio: string | null): void {
    // Simple URL validation
    if (portfolio && !portfolio.startsWith('http')) {
      throw new Error('Portfolio URL must be a valid URL starting with http:// or https://');
    }
    this.portfolio = portfolio;
  }

  // Developer-specific business logic
  public canSubmitGames(): boolean {
    return this.isUserVerified() === true;
  }

  public canUpdateGames(): boolean {
    return true;
  }
}