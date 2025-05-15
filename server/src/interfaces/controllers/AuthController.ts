import { Request, Response } from 'express';
import passport from 'passport';
import { RegisterPlayerCommand } from '../../application/commands/RegisterPlayerCommand';
import { RegisterDeveloperCommand } from '../../application/commands/RegisterDeveloperCommand';
import { RegisterPlayerHandler } from '../../application/commands/handlers/RegisterPlayerHandler';
import { RegisterDeveloperHandler } from '../../application/commands/handlers/RegisterDeveloperHandler';
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { UserRole } from '@shared/schema';

const scryptAsync = promisify(scrypt);

export class AuthController {
  private registerPlayerHandler = new RegisterPlayerHandler();
  private registerDeveloperHandler = new RegisterDeveloperHandler();

  /**
   * Hash a password for storage
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  /**
   * Register a new player
   */
  registerPlayer = async (req: Request, res: Response): Promise<void> => {
    try {
      // Hash the password before passing to command
      const hashedPassword = await this.hashPassword(req.body.password);
      
      const command = new RegisterPlayerCommand({
        ...req.body,
        password: hashedPassword,
        role: UserRole.PLAYER
      });
      
      const user = await this.registerPlayerHandler.handle(command);
      
      // Log in the newly registered user
      req.login(user, (err) => {
        if (err) {
          res.status(500).json({ message: 'Login after registration failed', error: err.message });
          return;
        }
        
        // Don't send the password back to the client
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error: any) {
      res.status(400).json({ message: 'Registration failed', error: error.message });
    }
  };

  /**
   * Register a new game developer
   */
  registerDeveloper = async (req: Request, res: Response): Promise<void> => {
    try {
      // Hash the password before passing to command
      const hashedPassword = await this.hashPassword(req.body.password);
      
      const command = new RegisterDeveloperCommand({
        ...req.body,
        password: hashedPassword,
        role: UserRole.GAME_DEVELOPER
      });
      
      const user = await this.registerDeveloperHandler.handle(command);
      
      // Log in the newly registered user
      req.login(user, (err) => {
        if (err) {
          res.status(500).json({ message: 'Login after registration failed', error: err.message });
          return;
        }
        
        // Don't send the password back to the client
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error: any) {
      res.status(400).json({ message: 'Registration failed', error: error.message });
    }
  };

  /**
   * Login a user (works for both player and developer)
   */
  login = (req: Request, res: Response): void => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: 'Login failed', error: err.message });
      }
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login failed', error: err.message });
        }
        
        // Don't send the password back to the client
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res);
  };

  /**
   * Logout a user
   */
  logout = (req: Request, res: Response): void => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed', error: err.message });
      }
      
      res.status(200).json({ message: 'Logged out successfully' });
    });
  };

  /**
   * Get the current user
   */
  getCurrentUser = (req: Request, res: Response): void => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    
    // Don't send the password back to the client
    const { password, ...userWithoutPassword } = req.user;
    res.status(200).json(userWithoutPassword);
  };
}