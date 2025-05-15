import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { UserEntity } from "../../domain/entities/UserEntity";
import { PlayerEntity } from "../../domain/entities/PlayerEntity";
import { DeveloperEntity } from "../../domain/entities/DeveloperEntity";
import { users, UserRole } from "../../../../shared/schema";
import { db } from "../../../db";
import { eq } from "drizzle-orm";

/**
 * Implementation of the UserRepository using Drizzle ORM
 */
export class UserRepository implements IUserRepository {
  /**
   * Find a user by their ID
   */
  async findById(id: number): Promise<UserEntity | null> {
    const [userData] = await db.select().from(users).where(eq(users.id, id));
    
    if (!userData) {
      return null;
    }
    
    return this.mapToEntity(userData);
  }
  
  /**
   * Find a user by their username
   */
  async findByUsername(username: string): Promise<UserEntity | null> {
    const [userData] = await db.select().from(users).where(eq(users.username, username));
    
    if (!userData) {
      return null;
    }
    
    return this.mapToEntity(userData);
  }
  
  /**
   * Check if a username already exists
   */
  async usernameExists(username: string): Promise<boolean> {
    const [userData] = await db.select().from(users).where(eq(users.username, username));
    return !!userData;
  }
  
  /**
   * Save a user entity
   */
  async save(entity: UserEntity): Promise<UserEntity> {
    const entityId = entity.getId();
    
    if (entityId) {
      // Update existing user
      const [updatedUser] = await db
        .update(users)
        .set({
          username: entity.getUsername(),
          password: entity.getPasswordHash(),
          role: entity.getRole(),
          email: entity.getEmail(),
          avatarUrl: entity.getAvatarUrl(),
          bio: entity.getBio(),
          displayName: entity.getDisplayName(),
          lastLogin: entity.getLastLogin(),
          isVerified: entity.isUserVerified()
        })
        .where(eq(users.id, entityId))
        .returning();
      
      return this.mapToEntity(updatedUser);
    } else {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          username: entity.getUsername(),
          password: entity.getPasswordHash(),
          role: entity.getRole(),
          email: entity.getEmail(),
          avatarUrl: entity.getAvatarUrl(),
          bio: entity.getBio(),
          displayName: entity.getDisplayName(),
          createdAt: entity.getCreatedAt(),
          lastLogin: entity.getLastLogin(),
          isVerified: entity.isUserVerified()
        })
        .returning();
      
      return this.mapToEntity(newUser);
    }
  }
  
  /**
   * Save a player entity
   */
  async savePlayer(entity: PlayerEntity): Promise<PlayerEntity> {
    const savedEntity = await this.save(entity);
    return savedEntity as PlayerEntity;
  }
  
  /**
   * Save a developer entity
   */
  async saveDeveloper(entity: DeveloperEntity): Promise<DeveloperEntity> {
    // First save the base user data
    const savedEntity = await this.save(entity);
    
    // TODO: In a more complex system, we might need a developers table
    // to store developer-specific fields like companyName and portfolio
    
    return savedEntity as DeveloperEntity;
  }
  
  /**
   * Map database user record to domain entity
   */
  private mapToEntity(userData: any): UserEntity {
    switch (userData.role) {
      case UserRole.PLAYER:
        return new PlayerEntity(
          userData.username,
          userData.password,
          {
            id: userData.id,
            email: userData.email,
            displayName: userData.displayName,
            avatarUrl: userData.avatarUrl,
            bio: userData.bio,
            createdAt: userData.createdAt,
            lastLogin: userData.lastLogin,
            isVerified: userData.isVerified
          }
        );
        
      case UserRole.GAME_DEVELOPER:
        return new DeveloperEntity(
          userData.username,
          userData.password,
          {
            id: userData.id,
            email: userData.email,
            displayName: userData.displayName,
            avatarUrl: userData.avatarUrl,
            bio: userData.bio,
            // In a complete implementation, we'd retrieve these from a developers table
            companyName: userData.displayName,  // Using displayName as fallback
            portfolio: null,
            createdAt: userData.createdAt,
            lastLogin: userData.lastLogin,
            isVerified: userData.isVerified
          }
        );
        
      default:
        // For other roles or if we need a generic user
        // In a complete system we might add an AdminEntity
        throw new Error(`User role ${userData.role} not supported`);
    }
  }
}