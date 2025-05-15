import { User } from "../entities/User";
import { EntityId } from "../value-objects/EntityId";

/**
 * User Repository Interface
 * Following the Repository pattern from Domain-Driven Design
 */
export interface UserRepository {
  /**
   * Find all users
   */
  findAll(): Promise<User[]>;
  
  /**
   * Find a user by ID
   * @param id The user ID
   */
  findById(id: EntityId): Promise<User | null>;
  
  /**
   * Find a user by username
   * @param username The username
   */
  findByUsername(username: string): Promise<User | null>;
  
  /**
   * Save a user (create or update)
   * @param user The user to save
   */
  save(user: User): Promise<User>;
  
  /**
   * Delete a user
   * @param id The user ID
   */
  delete(id: EntityId): Promise<void>;
}