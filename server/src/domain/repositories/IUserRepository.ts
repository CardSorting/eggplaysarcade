import { UserEntity } from '../entities/UserEntity';
import { PlayerEntity } from '../entities/PlayerEntity';
import { DeveloperEntity } from '../entities/DeveloperEntity';

/**
 * User Repository Interface
 * Following the Repository pattern from DDD, this defines
 * the contract for user data access
 */
export interface IUserRepository {
  /**
   * Find a user by their ID
   */
  findById(id: number): Promise<UserEntity | null>;
  
  /**
   * Find a user by their username
   */
  findByUsername(username: string): Promise<UserEntity | null>;
  
  /**
   * Find a user by their email
   */
  findByEmail(email: string): Promise<UserEntity | null>;
  
  /**
   * Save a user (create or update)
   */
  save(user: UserEntity): Promise<UserEntity>;
  
  /**
   * Find a player by their ID
   */
  findPlayerById(id: number): Promise<PlayerEntity | null>;
  
  /**
   * Find a developer by their ID
   */
  findDeveloperById(id: number): Promise<DeveloperEntity | null>;
  
  /**
   * Create a new player
   */
  createPlayer(player: PlayerEntity): Promise<PlayerEntity>;
  
  /**
   * Create a new developer
   */
  createDeveloper(developer: DeveloperEntity): Promise<DeveloperEntity>;
}