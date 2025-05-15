import { Request, Response } from 'express';
import { DiContainer } from '../../../infrastructure/config/DiContainer';
import { UserDTO } from '../../../application/dto/UserDTO';

/**
 * User Controller following the Controller pattern
 * Handles HTTP requests related to users
 */
export class UserController {
  /**
   * Register a new user
   */
  async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' });
        return;
      }
      
      const container = DiContainer.getInstance();
      const createUserCommand = container.getCreateUserCommand();
      
      try {
        const user = await createUserCommand.execute({ username, password });
        res.status(201).json(UserDTO.fromEntity(user));
      } catch (error: any) {
        if (error.message.includes('already taken')) {
          res.status(400).json({ message: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to register user' });
    }
  }
}