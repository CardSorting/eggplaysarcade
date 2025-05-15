import { Category } from "../../domain/entities/Category";
import { EntityId } from "../../domain/value-objects/EntityId";
import { CategoryRepository } from "../../domain/repositories/CategoryRepository";
import { db } from "../../../db";
import { categories } from "@shared/schema";
import { eq, like } from "drizzle-orm";

/**
 * Database implementation of the CategoryRepository
 * Following the Repository pattern and Adapter pattern
 */
export class DbCategoryRepository implements CategoryRepository {
  /**
   * Find all categories
   */
  async findAll(): Promise<Category[]> {
    const result = await db.select().from(categories);
    return result.map(this.mapToEntity);
  }

  /**
   * Find a category by its ID
   */
  async findById(id: EntityId): Promise<Category | null> {
    const [result] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id.value));
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * Find a category by its name
   */
  async findByName(name: string): Promise<Category | null> {
    const [result] = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name));
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * Save a category (create or update)
   */
  async save(category: Category): Promise<Category> {
    if (category.id) {
      // Update
      const [updated] = await db
        .update(categories)
        .set({
          name: category.name,
          icon: category.icon
        })
        .where(eq(categories.id, category.id.value))
        .returning();
      
      return this.mapToEntity(updated);
    } else {
      // Insert
      const [created] = await db
        .insert(categories)
        .values({
          name: category.name,
          icon: category.icon
        })
        .returning();
      
      return this.mapToEntity(created);
    }
  }

  /**
   * Delete a category
   */
  async delete(id: EntityId): Promise<void> {
    await db
      .delete(categories)
      .where(eq(categories.id, id.value));
  }

  /**
   * Map a database category record to a Category domain entity
   */
  private mapToEntity(categoryData: typeof categories.$inferSelect): Category {
    return Category.reconstitute(
      categoryData.id,
      categoryData.name,
      categoryData.icon
    );
  }
}