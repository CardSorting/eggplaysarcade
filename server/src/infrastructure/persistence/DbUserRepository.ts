import { User } from "../../domain/entities/User";
import { EntityId } from "../../domain/value-objects/EntityId";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { db } from "../../../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Database implementation of the UserRepository
 * Following the Repository pattern and Adapter pattern
 */
export class DbUserRepository implements UserRepository {
  /**
   * Find all users
   */
  async findAll(): Promise<User[]> {
    const result = await db.select().from(users);
    return result.map(this.mapToEntity);
  }

  /**
   * Find a user by ID
   */
  async findById(id: EntityId): Promise<User | null> {
    const [result] = await db
      .select()
      .from(users)
      .where(eq(users.id, id.value));
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * Find a user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    const [result] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * Save a user (create or update)
   */
  async save(user: User): Promise<User> {
    if (user.id) {
      // Update
      const [updated] = await db
        .update(users)
        .set({
          username: user.username,
          password: user.passwordHash
        })
        .where(eq(users.id, user.id.value))
        .returning();
      
      return this.mapToEntity(updated);
    } else {
      // Insert
      const [created] = await db
        .insert(users)
        .values({
          username: user.username,
          password: user.passwordHash
        })
        .returning();
      
      return this.mapToEntity(created);
    }
  }

  /**
   * Delete a user
   */
  async delete(id: EntityId): Promise<void> {
    await db
      .delete(users)
      .where(eq(users.id, id.value));
  }

  /**
   * Map a database user record to a User domain entity
   */
  private mapToEntity(userData: typeof users.$inferSelect): User {
    return User.reconstitute(
      userData.id,
      userData.username,
      userData.password
    );
  }
}