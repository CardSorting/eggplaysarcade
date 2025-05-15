import { User } from "../../domain/entities/User";
import { EntityId } from "../../domain/value-objects/EntityId";
import { UserRepository } from "../../domain/repositories/UserRepository";

/**
 * In-memory implementation of the UserRepository interface
 * Following the Repository pattern from Domain-Driven Design
 */
export class MemUserRepository implements UserRepository {
  private users: Map<number, User>;
  private nextId: number;

  constructor() {
    this.users = new Map<number, User>();
    this.nextId = 1;
  }

  /**
   * Find all users
   */
  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  /**
   * Find a user by ID
   */
  async findById(id: EntityId): Promise<User | null> {
    const user = this.users.get(id.value);
    return user || null;
  }

  /**
   * Find a user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    const user = Array.from(this.users.values())
      .find(user => user.username === username);
    return user || null;
  }

  /**
   * Save a user
   */
  async save(user: User): Promise<User> {
    // If the user doesn't have an ID or has an ID but doesn't exist in our map,
    // assign it a new ID
    if (!user.id || !this.users.has(user.id.value)) {
      const id = new EntityId(this.nextId++);
      const newUser = new User(
        id,
        user.username,
        user.email,
        user.passwordHash,
        user.avatarUrl,
        user.bio,
        user.games,
        user.ratings
      );

      this.users.set(id.value, newUser);
      return newUser;
    }

    // Otherwise, update the existing user
    this.users.set(user.id.value, user);
    return user;
  }

  /**
   * Update a user
   */
  async update(user: User): Promise<User> {
    if (!user.id || !this.users.has(user.id.value)) {
      throw new Error(`User with ID ${user.id?.value} not found`);
    }

    this.users.set(user.id.value, user);
    return user;
  }

  /**
   * Delete a user
   */
  async delete(id: EntityId): Promise<void> {
    if (!this.users.has(id.value)) {
      throw new Error(`User with ID ${id.value} not found`);
    }

    this.users.delete(id.value);
  }
}