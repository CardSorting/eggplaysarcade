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
   * Find a category by ID
   */
  findById(id: EntityId): Promise<Category | null>;
  
  /**
   * Save a category
   */
  save(category: Category): Promise<Category>;
  
  /**
   * Update a category
   */
  update(category: Category): Promise<Category>;
  
  /**
   * Delete a category
   */
  delete(id: EntityId): Promise<void>;
}