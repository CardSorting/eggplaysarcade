import { UserRole } from "../../../../shared/schema";

/**
 * Base User Entity
 * This is an abstract class that represents common user properties and behavior
 * Following Domain-Driven Design principles, this entity contains business logic
 */
export abstract class UserEntity {
  private id: number | null;
  private username: string;
  private passwordHash: string;
  private role: UserRole;
  private email: string | null;
  private avatarUrl: string | null;
  private bio: string | null;
  private displayName: string | null;
  private createdAt: Date;
  private lastLogin: Date | null;
  private isVerified: boolean | null;

  constructor(
    username: string,
    passwordHash: string,
    options: {
      id?: number;
      role?: UserRole;
      email?: string | null;
      avatarUrl?: string | null;
      bio?: string | null;
      displayName?: string | null;
      createdAt?: Date;
      lastLogin?: Date | null;
      isVerified?: boolean | null;
    } = {}
  ) {
    this.id = options.id || null;
    this.username = username;
    this.passwordHash = passwordHash;
    this.role = options.role || UserRole.PLAYER;
    this.email = options.email || null;
    this.avatarUrl = options.avatarUrl || null;
    this.bio = options.bio || null;
    this.displayName = options.displayName || null;
    this.createdAt = options.createdAt || new Date();
    this.lastLogin = options.lastLogin || null;
    this.isVerified = options.isVerified || false;
  }

  // Getters
  public getId(): number | null {
    return this.id;
  }

  public getUsername(): string {
    return this.username;
  }

  public getPasswordHash(): string {
    return this.passwordHash;
  }

  public getRole(): UserRole {
    return this.role;
  }

  public getEmail(): string | null {
    return this.email;
  }

  public getAvatarUrl(): string | null {
    return this.avatarUrl;
  }

  public getBio(): string | null {
    return this.bio;
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

  public isUserVerified(): boolean | null {
    return this.isVerified;
  }

  // Setters with validation logic
  public setUsername(username: string): void {
    if (!username || username.trim().length < 3) {
      throw new Error("Username must be at least 3 characters long");
    }
    this.username = username;
  }

  public setEmail(email: string | null): void {
    // Simple email validation
    if (email && !email.includes('@')) {
      throw new Error("Invalid email format");
    }
    this.email = email;
  }

  public setDisplayName(displayName: string | null): void {
    this.displayName = displayName;
  }

  public setBio(bio: string | null): void {
    this.bio = bio;
  }

  public setAvatarUrl(avatarUrl: string | null): void {
    this.avatarUrl = avatarUrl;
  }

  public setLastLogin(date: Date | null): void {
    this.lastLogin = date;
  }

  public setVerified(isVerified: boolean): void {
    this.isVerified = isVerified;
  }

  // Business logic methods
  public updateLastLogin(): void {
    this.lastLogin = new Date();
  }

  public verify(): void {
    this.isVerified = true;
  }
}