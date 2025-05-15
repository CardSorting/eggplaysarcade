import { Request, Response } from "express";
import { CategoryRepository } from "../../../domain/repositories/CategoryRepository";
import { GameRepository } from "../../../domain/repositories/GameRepository";
import { EntityId } from "../../../domain/value-objects/EntityId";
import { Category } from "../../../domain/entities/Category";
import { GameDTO, CategoryDTO } from "../../../application/dto/GameDTO";

/**
 * Controller for category-related API endpoints
 * Following the Controller pattern from Clean Architecture
 */
export class CategoryController {
  private readonly categoryRepository: CategoryRepository;
  private readonly gameRepository: GameRepository;

  constructor(
    categoryRepository: CategoryRepository,
    gameRepository: GameRepository
  ) {
    this.categoryRepository = categoryRepository;
    this.gameRepository = gameRepository;
  }

  /**
   * Get all categories
   */
  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.categoryRepository.findAll();
      const categoryDTOs = categories.map(category => CategoryDTO.fromEntity(category));
      res.status(200).json(categoryDTOs);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  }

  /**
   * Get a category by ID
   */
  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid category ID" });
        return;
      }
      
      const category = await this.categoryRepository.findById(new EntityId(id));
      
      if (!category) {
        res.status(404).json({ error: "Category not found" });
        return;
      }
      
      // Get games for this category
      const games = await this.gameRepository.findByCategory(category.id!);
      
      // Convert to DTO
      const categoryDTO = CategoryDTO.fromEntity(category);
      
      // Add games to response
      const response = {
        ...categoryDTO,
        games: games.map(game => GameDTO.fromEntity(game))
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ error: "Failed to fetch category" });
    }
  }

  /**
   * Create a new category
   */
  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const { name, icon } = req.body;
      
      if (!name) {
        res.status(400).json({ error: "Name is required" });
        return;
      }
      
      // Create a new category
      const category = Category.create(name, icon || "ri-folder-line");
      
      // Save the category
      const savedCategory = await this.categoryRepository.save(category);
      
      // Convert to DTO
      const categoryDTO = CategoryDTO.fromEntity(savedCategory);
      
      res.status(201).json(categoryDTO);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  }
}