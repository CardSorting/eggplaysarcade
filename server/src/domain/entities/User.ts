import { EntityId } from "../value-objects/EntityId";
import { DEFAULT_ROLE, RolePermissions, UserRole } from "../enums/UserRole";

/**
 * User entity representing a user in the domain
 * Following the Domain-Driven Design principles
 */
export class User {
  private _id: EntityId | null;
  private _username: string;
  private _passwordHash: string;
  private _role: UserRole;
  private _email: string | null;
  private _avatarUrl: string | null;
  private _bio: string | null;

  private constructor(
    id: EntityId | null,
    username: string,
    passwordHash: string,
    role: UserRole = DEFAULT_ROLE,
    email: string | null = null,
    avatarUrl: string | null = null,
    bio: string | null = null
  ) {
    this._id = id;
    this._username = username;
    this._passwordHash = passwordHash;
    this._role = role;
    this._email = email;
    this._avatarUrl = avatarUrl;
    this._bio = bio;
  }

  /**
   * Create a new user
   */
  public static create(
    username: string,
    passwordHash: string,
    role: UserRole = DEFAULT_ROLE,
    email: string | null = null
  ): User {
    if (!username || !passwordHash) {
      throw new Error("Username and password are required");
    }
    
    return new User(
      null,
      username,
      passwordHash,
      role,
      email
    );
  }

  /**
   * Reconstruct a user from persistence
   */
  public static reconstitute(
    id: number,
    username: string,
    passwordHash: string,
    role: UserRole = DEFAULT_ROLE,
    email: string | null = null,
    avatarUrl: string | null = null,
    bio: string | null = null
  ): User {
    return new User(
      new EntityId(id),
      username,
      passwordHash,
      role,
      email,
      avatarUrl,
      bio
    );
  }

  /**
   * Get the ID of this user
   */
  public get id(): EntityId | null {
    return this._id;
  }

  /**
   * Get the username of this user
   */
  public get username(): string {
    return this._username;
  }

  /**
   * Get the password hash of this user
   */
  public get passwordHash(): string {
    return this._passwordHash;
  }

  /**
   * Get the role of this user
   */
  public get role(): UserRole {
    return this._role;
  }

  /**
   * Get the email of this user
   */
  public get email(): string | null {
    return this._email;
  }

  /**
   * Get the avatar URL of this user
   */
  public get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  /**
   * Get the bio of this user
   */
  public get bio(): string | null {
    return this._bio;
  }

  /**
   * Check if user has a specific permission
   */
  public hasPermission(permission: string): boolean {
    return RolePermissions[this._role]?.includes(permission) || false;
  }

  /**
   * Update user's password
   */
  public updatePassword(passwordHash: string): void {
    this._passwordHash = passwordHash;
  }

  /**
   * Update user's role
   */
  public updateRole(role: UserRole): void {
    this._role = role;
  }

  /**
   * Update user's email
   */
  public updateEmail(email: string | null): void {
    this._email = email;
  }

  /**
   * Update user's avatar URL
   */
  public updateAvatarUrl(avatarUrl: string | null): void {
    this._avatarUrl = avatarUrl;
  }

  /**
   * Update user's bio
   */
  public updateBio(bio: string | null): void {
    this._bio = bio;
  }
}