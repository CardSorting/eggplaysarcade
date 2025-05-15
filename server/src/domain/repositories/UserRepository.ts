import { User } from "../entities/User";
import { EntityId } from "../value-objects/EntityId";

/**
 * Repository interface for User entities
 * Following the Repository pattern from Domain-Driven Design
 */
export interface UserRepository {
  /**
   * Find all users
   */
  findAll(): Promise<User[]>;
  
  /**
   * Find a user by ID
   */
  findById(id: EntityId): Promise<User | null>;
  
  /**
   * Find a user by username
   */
  findByUsername(username: string): Promise<User | null>;
  
  /**
   * Save a user
   */
  save(user: User): Promise<User>;
  
  /**
   * Update a user
   */
  update(user: User): Promise<User>;
  
  /**
   * Delete a user
   */
  delete(id: EntityId): Promise<void>;
}