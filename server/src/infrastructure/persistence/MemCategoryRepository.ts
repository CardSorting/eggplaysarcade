import { CategoryRepository } from '../../domain/repositories/CategoryRepository';
import { Category } from '../../domain/entities/Category';
import { EntityId } from '../../domain/value-objects/EntityId';

/**
 * In-memory implementation of the CategoryRepository
 */
export class MemCategoryRepository implements CategoryRepository {
  private categories: Map<number, Category>;
  
  constructor() {
    this.categories = new Map<number, Category>();
    
    // Initialize with default categories
    this.initializeDefaultCategories();
  }

  private async initializeDefaultCategories(): Promise<void> {
    const defaultCategories = [
      { name: "Action", icon: "ri-sword-line" },
      { name: "Puzzle", icon: "ri-puzzle-line" },
      { name: "Racing", icon: "ri-car-line" },
      { name: "Arcade", icon: "ri-game-line" },
      { name: "Adventure", icon: "ri-map-line" },
      { name: "Shooter", icon: "ri-rocket-line" }
    ];
    
    for (const data of defaultCategories) {
      const category = Category.create(data.name, data.icon);
      await this.save(category);
    }
  }

  async findAll(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async findById(id: EntityId): Promise<Category | null> {
    const category = this.categories.get(id.value);
    return category || null;
  }

  async save(category: Category): Promise<Category> {
    this.categories.set(category.id.value, category);
    return category;
  }
}