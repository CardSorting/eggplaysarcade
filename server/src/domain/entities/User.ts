import { EntityId } from "../value-objects/EntityId";

/**
 * User entity representing a user in the domain
 * Following the Domain-Driven Design principles
 */
export class User {
  private _id: EntityId | null;
  private _username: string;
  private _passwordHash: string;
  private _email: string | null;
  private _createdAt: Date;
  private _isAdmin: boolean;

  private constructor(
    id: EntityId | null,
    username: string,
    passwordHash: string,
    email: string | null,
    createdAt: Date,
    isAdmin: boolean = false
  ) {
    this._id = id;
    this._username = username;
    this._passwordHash = passwordHash;
    this._email = email;
    this._createdAt = createdAt;
    this._isAdmin = isAdmin;
  }

  /**
   * Create a new user
   */
  public static create(
    username: string,
    passwordHash: string,
    email: string | null = null
  ): User {
    return new User(
      null,
      username,
      passwordHash,
      email,
      new Date(),
      false
    );
  }

  /**
   * Reconstruct a user from persistence
   */
  public static reconstitute(
    id: number,
    username: string,
    passwordHash: string,
    email: string | null,
    createdAt: Date,
    isAdmin: boolean = false
  ): User {
    return new User(
      new EntityId(id),
      username,
      passwordHash,
      email,
      createdAt,
      isAdmin
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
   * Get the email of this user
   */
  public get email(): string | null {
    return this._email;
  }

  /**
   * Get the creation date of this user
   */
  public get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Check if this user is an admin
   */
  public get isAdmin(): boolean {
    return this._isAdmin;
  }

  /**
   * Set user as admin
   */
  public setAdmin(isAdmin: boolean): void {
    this._isAdmin = isAdmin;
  }

  /**
   * Update user's email
   */
  public updateEmail(email: string | null): void {
    this._email = email;
  }

  /**
   * Update user's password
   */
  public updatePassword(passwordHash: string): void {
    this._passwordHash = passwordHash;
  }
}