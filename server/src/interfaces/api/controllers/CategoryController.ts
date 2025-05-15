import { Request, Response } from 'express';
import { DiContainer } from '../../../infrastructure/config/DiContainer';
import { CategoryDTO } from '../../../application/dto/CategoryDTO';

/**
 * Category Controller following the Controller pattern
 * Handles HTTP requests related to categories
 */
export class CategoryController {
  /**
   * Get all categories
   */
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const includeGames = req.query.includeGames === 'true';
      
      const container = DiContainer.getInstance();
      const getCategoriesQuery = container.getCategoriesQuery();
      
      const categories = await getCategoriesQuery.execute(includeGames);
      
      res.json(CategoryDTO.fromEntities(categories));
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch categories' });
    }
  }
}