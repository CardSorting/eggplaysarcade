import { UserRole } from "../../shared/schema";

/**
 * User Entity - Core domain entity following DDD principles
 * This is the heart of our domain model for users
 */
export abstract class UserEntity {
  protected id: number | null;
  protected username: string;
  protected email: string | null;
  protected passwordHash: string;
  protected role: UserRole;
  protected bio: string | null;
  protected avatarUrl: string | null;
  protected displayName: string | null;
  protected createdAt: Date;
  protected lastLogin: Date | null;
  protected isVerified: boolean;

  constructor(
    id: number | null,
    username: string,
    email: string | null,
    passwordHash: string,
    role: UserRole,
    bio: string | null = null,
    avatarUrl: string | null = null,
    displayName: string | null = null,
    createdAt: Date = new Date(),
    lastLogin: Date | null = null,
    isVerified: boolean = false
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.bio = bio;
    this.avatarUrl = avatarUrl;
    this.displayName = displayName;
    this.createdAt = createdAt;
    this.lastLogin = lastLogin;
    this.isVerified = isVerified;
    
    this.validate();
  }

  /**
   * Domain validation rules
   */
  protected validate(): void {
    if (!this.username || this.username.trim() === '') {
      throw new Error('Username cannot be empty');
    }
    
    if (!this.passwordHash || this.passwordHash.trim() === '') {
      throw new Error('Password cannot be empty');
    }
  }

  // Getters
  public getId(): number | null {
    return this.id;
  }

  public getUsername(): string {
    return this.username;
  }

  public getEmail(): string | null {
    return this.email;
  }

  public getPasswordHash(): string {
    return this.passwordHash;
  }

  public getRole(): UserRole {
    return this.role;
  }

  public getBio(): string | null {
    return this.bio;
  }

  public getAvatarUrl(): string | null {
    return this.avatarUrl;
  }

  public getDisplayName(): string | null {
    return this.displayName;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getLastLogin(): Date | null {
    return this.lastLogin;
  }
  
  public isUserVerified(): boolean {
    return this.isVerified;
  }

  // Business logic methods
  public updateLastLogin(): void {
    this.lastLogin = new Date();
  }
  
  public verify(): void {
    this.isVerified = true;
  }
  
  public updateProfile(bio: string | null, avatarUrl: string | null, displayName: string | null): void {
    this.bio = bio;
    this.avatarUrl = avatarUrl;
    this.displayName = displayName;
  }
  
  /**
   * Abstract method to be implemented by specific user subclasses
   * This enforces type-specific validation and business rules
   */
  public abstract canPerformAction(action: string): boolean;
}