import { Category } from "../entities/Category";
import { EntityId } from "../value-objects/EntityId";

/**
 * Repository interface for Category entities
 * Following the Repository pattern from Domain-Driven Design
 */
export interface CategoryRepository {
  /**
   * Find all categories
   */
  findAll(): Promise<Category[]>;
  
  /**
   * Find a category by its ID
   */
  findById(id: EntityId): Promise<Category | null>;
  
  /**
   * Find a category by its name
   */
  findByName(name: string): Promise<Category | null>;
  
  /**
   * Save a category (create or update)
   */
  save(category: Category): Promise<Category>;
  
  /**
   * Delete a category
   */
  delete(id: EntityId): Promise<void>;
}