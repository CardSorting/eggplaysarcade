import { EntityId } from "../value-objects/EntityId";

/**
 * User entity representing a user in the domain
 * Following the Domain-Driven Design principles
 */
export class User {
  private _id: EntityId | null;
  private _username: string;
  private _passwordHash: string;

  private constructor(
    id: EntityId | null,
    username: string,
    passwordHash: string
  ) {
    this._id = id;
    this._username = username;
    this._passwordHash = passwordHash;
  }

  /**
   * Create a new user
   */
  public static create(
    username: string,
    passwordHash: string
  ): User {
    if (!username || !passwordHash) {
      throw new Error("Username and password are required");
    }
    
    return new User(
      null,
      username,
      passwordHash
    );
  }

  /**
   * Reconstruct a user from persistence
   */
  public static reconstitute(
    id: number,
    username: string,
    passwordHash: string
  ): User {
    return new User(
      new EntityId(id),
      username,
      passwordHash
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
   * Update user's password
   */
  public updatePassword(passwordHash: string): void {
    this._passwordHash = passwordHash;
  }
}