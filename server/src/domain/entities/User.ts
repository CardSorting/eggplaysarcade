import { EntityId } from "../value-objects/EntityId";
import { UserRole } from "../enums/UserRole";
import { Permission } from "../valueObjects/Permission";
import { RolePermissionService } from "../../application/services/RolePermissionService";

/**
 * User entity class
 * Following the Entity pattern from Domain-Driven Design
 */
export class User {
  // Default role for new users
  private static readonly DEFAULT_ROLE = UserRole.PLAYER;
  
  // Entity identity
  public readonly id: EntityId | null;
  
  // Entity properties
  private _username: string;
  private _passwordHash: string;
  private _role: UserRole;
  private _email: string | null;
  private _avatarUrl: string | null;
  private _bio: string | null;
  
  // Service for permission checking
  private readonly rolePermissionService: RolePermissionService;

  /**
   * Private constructor - use static factory methods to create instances
   */
  private constructor(
    id: number | null,
    username: string,
    passwordHash: string,
    role: UserRole = User.DEFAULT_ROLE,
    email: string | null = null,
    avatarUrl: string | null = null,
    bio: string | null = null
  ) {
    this.id = id !== null ? new EntityId(id) : null;
    this._username = username;
    this._passwordHash = passwordHash;
    this._role = role;
    this._email = email;
    this._avatarUrl = avatarUrl;
    this._bio = bio;
    this.rolePermissionService = new RolePermissionService();
  }

  /**
   * Factory method to create a new User entity
   */
  public static create(
    username: string,
    passwordHash: string,
    role: UserRole = User.DEFAULT_ROLE,
    email: string | null = null,
    avatarUrl: string | null = null,
    bio: string | null = null
  ): User {
    return new User(null, username, passwordHash, role, email, avatarUrl, bio);
  }

  /**
   * Factory method to reconstitute a User entity from persistence
   */
  public static reconstitute(
    id: number,
    username: string,
    passwordHash: string,
    role: UserRole = User.DEFAULT_ROLE,
    email: string | null = null,
    avatarUrl: string | null = null,
    bio: string | null = null
  ): User {
    return new User(id, username, passwordHash, role, email, avatarUrl, bio);
  }

  // Getters and setters
  get username(): string {
    return this._username;
  }

  set username(value: string) {
    if (!value || value.trim().length < 3) {
      throw new Error("Username must be at least 3 characters long");
    }
    this._username = value;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  set passwordHash(value: string) {
    if (!value) {
      throw new Error("Password hash cannot be empty");
    }
    this._passwordHash = value;
  }

  get role(): UserRole {
    return this._role;
  }

  set role(value: UserRole) {
    this._role = value;
  }

  get email(): string | null {
    return this._email;
  }

  set email(value: string | null) {
    this._email = value;
  }

  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  set avatarUrl(value: string | null) {
    this._avatarUrl = value;
  }

  get bio(): string | null {
    return this._bio;
  }

  set bio(value: string | null) {
    this._bio = value;
  }

  /**
   * Check if user has a specific permission
   */
  public hasPermission(permission: Permission): boolean {
    return this.rolePermissionService.hasPermission(this._role, permission);
  }

  /**
   * Get all permissions for this user
   */
  public getPermissions(): Permission[] {
    return this.rolePermissionService.getPermissionsForRole(this._role);
  }
}