import { UserEntity } from "../entities/UserEntity";
import { PlayerEntity } from "../entities/PlayerEntity";
import { DeveloperEntity } from "../entities/DeveloperEntity";

/**
 * User Repository Interface
 * Following Clean Architecture, this defines the contract for user persistence operations
 */
export interface IUserRepository {
  // Find methods
  findById(id: number): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  
  // Save methods
  save(entity: UserEntity): Promise<UserEntity>;
  
  // Check methods
  usernameExists(username: string): Promise<boolean>;
  
  // Player-specific methods
  savePlayer(entity: PlayerEntity): Promise<PlayerEntity>;
  
  // Developer-specific methods
  saveDeveloper(entity: DeveloperEntity): Promise<DeveloperEntity>;
}