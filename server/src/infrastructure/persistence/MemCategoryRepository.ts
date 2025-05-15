import { Category } from "../../domain/entities/Category";
import { EntityId } from "../../domain/value-objects/EntityId";
import { CategoryRepository } from "../../domain/repositories/CategoryRepository";

/**
 * In-memory implementation of the CategoryRepository interface
 * Following the Repository pattern from Domain-Driven Design
 */
export class MemCategoryRepository implements CategoryRepository {
  private categories: Map<number, Category>;
  private nextId: number;

  constructor() {
    this.categories = new Map<number, Category>();
    this.nextId = 1;

    // Initialize with default categories for demo
    this.initializeDefaultCategories();
  }

  /**
   * Initialize default categories
   */
  private initializeDefaultCategories(): void {
    const defaultCategories = [
      { name: "Action", icon: "ri-sword-line" },
      { name: "Adventure", icon: "ri-treasure-map-line" },
      { name: "Puzzle", icon: "ri-puzzle-line" },
      { name: "Strategy", icon: "ri-chess-line" },
      { name: "Sports", icon: "ri-basketball-line" },
      { name: "Racing", icon: "ri-steering-2-line" },
    ];

    defaultCategories.forEach(cat => {
      const id = new EntityId(this.nextId++);
      const category = new Category(id, cat.name, cat.icon);
      this.categories.set(id.value, category);
    });
  }

  /**
   * Find all categories
   */
  async findAll(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  /**
   * Find a category by ID
   */
  async findById(id: EntityId): Promise<Category | null> {
    const category = this.categories.get(id.value);
    return category || null;
  }

  /**
   * Save a category
   */
  async save(category: Category): Promise<Category> {
    // If the category doesn't have an ID or has an ID but doesn't exist in our map,
    // assign it a new ID
    if (!category.id || !this.categories.has(category.id.value)) {
      const id = new EntityId(this.nextId++);
      const newCategory = new Category(
        id,
        category.name,
        category.icon,
        category.games
      );

      this.categories.set(id.value, newCategory);
      return newCategory;
    }

    // Otherwise, update the existing category
    this.categories.set(category.id.value, category);
    return category;
  }

  /**
   * Update a category
   */
  async update(category: Category): Promise<Category> {
    if (!category.id || !this.categories.has(category.id.value)) {
      throw new Error(`Category with ID ${category.id?.value} not found`);
    }

    this.categories.set(category.id.value, category);
    return category;
  }

  /**
   * Delete a category
   */
  async delete(id: EntityId): Promise<void> {
    if (!this.categories.has(id.value)) {
      throw new Error(`Category with ID ${id.value} not found`);
    }

    this.categories.delete(id.value);
  }
}