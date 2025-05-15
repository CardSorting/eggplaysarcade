import { User, UserRole } from '@shared/schema';

/**
 * Base User Entity following Domain-Driven Design principles
 * This is the core domain entity that represents a user in our system
 */
export abstract class UserEntity implements Omit<User, 'id'> {
  public username: string;
  public password: string;
  public email: string | null;
  public role: UserRole;
  public displayName: string | null;
  public avatarUrl: string | null;
  public bio: string | null;
  public isVerified: boolean | null;
  public createdAt: Date;
  public lastLogin: Date | null;
  public companyName: string | null = null;
  public portfolio: string | null = null;

  constructor(data: Partial<User>) {
    this.username = data.username!;
    this.password = data.password!;
    this.email = data.email || null;
    this.role = data.role!;
    this.displayName = data.displayName || null;
    this.avatarUrl = data.avatarUrl || null;
    this.bio = data.bio || null;
    this.isVerified = data.isVerified || false;
    this.createdAt = data.createdAt || new Date();
    this.lastLogin = data.lastLogin || null;
  }

  /**
   * Convert entity to a plain object suitable for database storage
   */
  public toObject(): Omit<User, 'id'> {
    return {
      username: this.username,
      password: this.password,
      email: this.email,
      role: this.role,
      displayName: this.displayName,
      avatarUrl: this.avatarUrl,
      bio: this.bio,
      isVerified: this.isVerified,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin,
      companyName: this.companyName,
      portfolio: this.portfolio
    };
  }
}

/**
 * Player-specific entity
 */
export class PlayerEntity extends UserEntity {
  constructor(data: Partial<User>) {
    super(data);
    this.role = UserRole.PLAYER;
  }
}

/**
 * Developer-specific entity with additional fields
 */
export class DeveloperEntity extends UserEntity {
  constructor(data: Partial<User>) {
    super(data);
    this.role = UserRole.GAME_DEVELOPER;
    this.companyName = data.companyName || null;
    this.portfolio = data.portfolio || null;
  }
}