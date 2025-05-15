import { EntityId } from "../value-objects/EntityId";
import { UserRole } from "../enums/UserRole";
import { Permission } from "../value-objects/Permission";

/**
 * User entity
 * Following the Entity pattern from Domain-Driven Design
 */
export class User {
  private readonly _id: EntityId;
  private _username: string;
  private _password: string;
  private _role: UserRole;
  private _email: string | null;
  private _avatarUrl: string | null;
  private _bio: string | null;
  private _permissions: Permission[];
  
  private constructor(
    id: EntityId,
    username: string,
    password: string,
    role: UserRole,
    email: string | null = null,
    avatarUrl: string | null = null,
    bio: string | null = null,
    permissions: Permission[] = []
  ) {
    this._id = id;
    this._username = username;
    this._password = password;
    this._role = role;
    this._email = email;
    this._avatarUrl = avatarUrl;
    this._bio = bio;
    this._permissions = permissions;
    
    this.validate();
  }
  
  /**
   * Create a new User entity
   */
  public static create(
    id: EntityId,
    username: string,
    password: string,
    role: UserRole = UserRole.PLAYER,
    email: string | null = null,
    avatarUrl: string | null = null,
    bio: string | null = null,
    permissions: Permission[] = []
  ): User {
    return new User(id, username, password, role, email, avatarUrl, bio, permissions);
  }
  
  /**
   * Validate the user entity
   */
  private validate(): void {
    if (!this._username || this._username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }
    
    if (!this._password || this._password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    if (this._email && !this.isValidEmail(this._email)) {
      throw new Error('Invalid email format');
    }
  }
  
  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Getters
  
  get id(): EntityId {
    return this._id;
  }
  
  get username(): string {
    return this._username;
  }
  
  get password(): string {
    return this._password;
  }
  
  get role(): UserRole {
    return this._role;
  }
  
  get email(): string | null {
    return this._email;
  }
  
  get avatarUrl(): string | null {
    return this._avatarUrl;
  }
  
  get bio(): string | null {
    return this._bio;
  }
  
  get permissions(): Permission[] {
    return [...this._permissions]; // Return a copy to prevent direct modification
  }
  
  // Setters with validation
  
  setUsername(username: string): void {
    if (!username || username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }
    this._username = username;
  }
  
  setPassword(password: string): void {
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    this._password = password;
  }
  
  setRole(role: UserRole): void {
    this._role = role;
  }
  
  setEmail(email: string | null): void {
    if (email && !this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    this._email = email;
  }
  
  setAvatarUrl(avatarUrl: string | null): void {
    this._avatarUrl = avatarUrl;
  }
  
  setBio(bio: string | null): void {
    this._bio = bio;
  }
  
  // Permission management
  
  hasPermission(permission: Permission | string): boolean {
    const permissionStr = permission instanceof Permission 
      ? permission.toString() 
      : permission;
      
    return this._permissions.some(p => p.toString() === permissionStr);
  }
  
  addPermission(permission: Permission): void {
    if (!this.hasPermission(permission)) {
      this._permissions.push(permission);
    }
  }
  
  removePermission(permission: Permission): void {
    this._permissions = this._permissions.filter(
      p => p.toString() !== permission.toString()
    );
  }
  
  setPermissions(permissions: Permission[]): void {
    this._permissions = [...permissions];
  }
  
  // Entity equality
  
  equals(other: User): boolean {
    if (!(other instanceof User)) {
      return false;
    }
    return this._id.equals(other._id);
  }
  
  // Serialization
  
  toJSON(): Record<string, any> {
    return {
      id: this._id.value,
      username: this._username,
      role: this._role,
      email: this._email,
      avatarUrl: this._avatarUrl,
      bio: this._bio,
      permissions: this._permissions.map(p => p.toString())
    };
  }
}