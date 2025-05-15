import { Category } from '../entities/Category';
import { EntityId } from '../value-objects/EntityId';

/**
 * Repository interface for Category entities
 */
export interface CategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: EntityId): Promise<Category | null>;
  save(category: Category): Promise<Category>;
}