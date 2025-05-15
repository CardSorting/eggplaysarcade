import { UserRole } from "../../../../shared/schema";

/**
 * Base User Entity following Domain-Driven Design principles
 * This is an abstract class that defines the core properties and methods for all user types
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
    role: UserRole,
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
    this.id = options.id || null;
    this.username = username;
    this.passwordHash = passwordHash;
    this.role = role;
    this.email = options.email || null;
    this.avatarUrl = options.avatarUrl || null;
    this.bio = options.bio || null;
    this.displayName = options.displayName || null;
    this.createdAt = options.createdAt || new Date();
    this.lastLogin = options.lastLogin || null;
    this.isVerified = options.isVerified || false;
  }

  // Getters and setters
  public getId(): number | null {
    return this.id;
  }

  public setId(id: number): void {
    // ID should only be set once by the persistence layer
    if (this.id === null) {
      this.id = id;
    }
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

  public setEmail(email: string): void {
    this.email = email;
  }

  public getAvatarUrl(): string | null {
    return this.avatarUrl;
  }

  public setAvatarUrl(url: string): void {
    this.avatarUrl = url;
  }

  public getBio(): string | null {
    return this.bio;
  }

  public setBio(bio: string): void {
    this.bio = bio;
  }

  public getDisplayName(): string | null {
    return this.displayName;
  }

  public setDisplayName(name: string): void {
    this.displayName = name;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getLastLogin(): Date | null {
    return this.lastLogin;
  }

  public setLastLogin(date: Date): void {
    this.lastLogin = date;
  }

  public isUserVerified(): boolean | null {
    return this.isVerified;
  }

  public setVerified(isVerified: boolean): void {
    this.isVerified = isVerified;
  }

  // Domain logic methods
  public abstract canSubmitGames(): boolean;
  public abstract canRateGames(): boolean;
  public abstract canEditProfile(): boolean;
}