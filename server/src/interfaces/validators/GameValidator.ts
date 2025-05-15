import { z } from 'zod';

/**
 * Game validation schema
 */
const gameSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  instructions: z.string().min(10, 'Instructions must be at least 10 characters'),
  thumbnailUrl: z.string().min(1, 'Thumbnail URL is required'),
  gameUrl: z.string().min(1, 'Game URL is required'),
  categoryId: z.number().positive('Category ID is required'),
  userId: z.number().positive('User ID is required'),
  tags: z.array(z.string()).optional(),
});

/**
 * Validates game data
 * Returns { success: true } if valid, or { success: false, message: string } if invalid
 */
export function validateGame(data: any): { success: boolean; message?: string } {
  try {
    gameSchema.parse(data);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return { success: false, message: errors };
    }
    return { success: false, message: 'Invalid game data' };
  }
}