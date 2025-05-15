import { UserRole } from "../../../../shared/schema";
import { UserEntity } from "./UserEntity";

/**
 * Game Developer Entity - represents a user who can create and submit games
 * Domain logic specific to game developers is implemented here
 */
export class DeveloperEntity extends UserEntity {
  private companyName: string | null;
  private portfolio: string | null;
  private verificationStatus: 'pending' | 'verified' | 'rejected';

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
      verificationStatus?: 'pending' | 'verified' | 'rejected';
    } = {}
  ) {
    super(username, passwordHash, UserRole.GAME_DEVELOPER, options);
    this.companyName = options.companyName || null;
    this.portfolio = options.portfolio || null;
    this.verificationStatus = options.verificationStatus || 'pending';
  }

  /**
   * Developer-specific business logic
   */
  
  // Game developers can submit games
  public canSubmitGames(): boolean {
    return this.verificationStatus === 'verified';
  }
  
  // Game developers can rate games
  public canRateGames(): boolean {
    return true;
  }
  
  // Game developers can edit their own profiles
  public canEditProfile(): boolean {
    return true;
  }
  
  // Developer-specific getters and setters
  public getCompanyName(): string | null {
    return this.companyName;
  }
  
  public setCompanyName(companyName: string): void {
    this.companyName = companyName;
  }
  
  public getPortfolio(): string | null {
    return this.portfolio;
  }
  
  public setPortfolio(portfolio: string): void {
    this.portfolio = portfolio;
  }
  
  public getVerificationStatus(): 'pending' | 'verified' | 'rejected' {
    return this.verificationStatus;
  }
  
  public setVerificationStatus(status: 'pending' | 'verified' | 'rejected'): void {
    this.verificationStatus = status;
  }
  
  // Domain-specific methods
  public isPendingVerification(): boolean {
    return this.verificationStatus === 'pending';
  }
  
  public isRejected(): boolean {
    return this.verificationStatus === 'rejected';
  }
  
  public hasValidProfile(): boolean {
    // Check if developer has completed their profile with required information
    return !!this.getCompanyName() || !!this.getDisplayName();
  }
}