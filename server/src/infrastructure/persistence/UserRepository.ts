import { db } from '../../../db';
import { users } from '../../../../shared/schema';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserEntity } from '../../domain/entities/UserEntity';
import { PlayerEntity } from '../../domain/entities/PlayerEntity';
import { DeveloperEntity } from '../../domain/entities/DeveloperEntity';
import { eq } from 'drizzle-orm';
import { UserRole } from '../../../../shared/schema';

/**
 * Database implementation of the User Repository
 * This class adapts the domain repository interface to the actual database
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
   * Find a user by their email
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    if (!email) return null;
    
    const [userData] = await db.select().from(users).where(eq(users.email, email));
    
    if (!userData) {
      return null;
    }
    
    return this.mapToEntity(userData);
  }
  
  /**
   * Save a user (create or update)
   */
  async save(user: UserEntity): Promise<UserEntity> {
    const id = user.getId();
    
    // Create common user data from entity
    const userData = {
      username: user.getUsername(),
      password: user.getPasswordHash(),
      role: user.getRole(),
      email: user.getEmail(),
      bio: user.getBio(),
      avatarUrl: user.getAvatarUrl(),
      displayName: user.getDisplayName(),
      isVerified: user.isUserVerified(),
      // lastLogin will be updated by the entity
      lastLogin: user.getLastLogin()
    };
    
    if (id) {
      // Update existing user
      const [updated] = await db
        .update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();
      
      return this.mapToEntity(updated);
    } else {
      // Insert new user
      const [created] = await db
        .insert(users)
        .values(userData)
        .returning();
      
      return this.mapToEntity(created);
    }
  }
  
  /**
   * Find a player by their ID
   */
  async findPlayerById(id: number): Promise<PlayerEntity | null> {
    const [userData] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .where(eq(users.role, UserRole.PLAYER));
    
    if (!userData) {
      return null;
    }
    
    return this.mapToPlayerEntity(userData);
  }
  
  /**
   * Find a developer by their ID
   */
  async findDeveloperById(id: number): Promise<DeveloperEntity | null> {
    const [userData] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .where(eq(users.role, UserRole.GAME_DEVELOPER));
    
    if (!userData) {
      return null;
    }
    
    return this.mapToDeveloperEntity(userData);
  }
  
  /**
   * Create a new player
   */
  async createPlayer(player: PlayerEntity): Promise<PlayerEntity> {
    // Delegate to save method
    const savedUser = await this.save(player);
    
    if (!(savedUser instanceof PlayerEntity)) {
      throw new Error('Expected PlayerEntity but got different entity type');
    }
    
    return savedUser as PlayerEntity;
  }
  
  /**
   * Create a new developer
   */
  async createDeveloper(developer: DeveloperEntity): Promise<DeveloperEntity> {
    // Delegate to save method
    const savedUser = await this.save(developer);
    
    if (!(savedUser instanceof DeveloperEntity)) {
      throw new Error('Expected DeveloperEntity but got different entity type');
    }
    
    return savedUser as DeveloperEntity;
  }
  
  /**
   * Map database user record to appropriate domain entity
   */
  private mapToEntity(userData: any): UserEntity {
    if (userData.role === UserRole.PLAYER) {
      return this.mapToPlayerEntity(userData);
    } else if (userData.role === UserRole.GAME_DEVELOPER) {
      return this.mapToDeveloperEntity(userData);
    } else {
      // Default mapping if role is not recognized
      // In a more complete implementation, we would have an AdminEntity as well
      return this.mapToPlayerEntity(userData);
    }
  }
  
  /**
   * Map database user record to PlayerEntity
   */
  private mapToPlayerEntity(userData: any): PlayerEntity {
    return new PlayerEntity(
      userData.id,
      userData.username,
      userData.email,
      userData.password, // Already hashed password from DB
      userData.bio,
      userData.avatarUrl,
      userData.displayName,
      userData.createdAt || new Date(),
      userData.lastLogin,
      userData.isVerified || false
    );
  }
  
  /**
   * Map database user record to DeveloperEntity
   */
  private mapToDeveloperEntity(userData: any): DeveloperEntity {
    return new DeveloperEntity(
      userData.id,
      userData.username,
      userData.email,
      userData.password, // Already hashed password from DB
      userData.bio,
      userData.avatarUrl,
      userData.displayName,
      userData.createdAt || new Date(),
      userData.lastLogin,
      userData.isVerified || false,
      userData.companyName,
      userData.portfolio
    );
  }
}