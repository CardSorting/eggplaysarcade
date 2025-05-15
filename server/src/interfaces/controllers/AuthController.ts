import { Request, Response } from 'express';
import { RegisterPlayerCommand } from '../../application/commands/RegisterPlayerCommand';
import { RegisterDeveloperCommand } from '../../application/commands/RegisterDeveloperCommand';
import { RegisterPlayerHandler } from '../../application/commands/handlers/RegisterPlayerHandler';
import { RegisterDeveloperHandler } from '../../application/commands/handlers/RegisterDeveloperHandler';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { insertPlayerSchema, insertDeveloperSchema } from '../../../../shared/schema';

/**
 * Controller for handling authentication-related requests
 * Following Clean Architecture principles, controllers transform HTTP requests into commands
 */
export class AuthController {
  constructor(
    private readonly registerPlayerHandler: RegisterPlayerHandler,
    private readonly registerDeveloperHandler: RegisterDeveloperHandler
  ) {}
  
  /**
   * Register a new player
   */
  async registerPlayer(req: Request, res: Response) {
    try {
      // Validate request data
      const validatedData = insertPlayerSchema.parse(req.body);
      
      // Create command
      const command = new RegisterPlayerCommand(
        validatedData.username,
        validatedData.password,
        validatedData.email || null,
        validatedData.displayName || null
      );
      
      // Execute command
      const player = await this.registerPlayerHandler.execute(command);
      
      // Login the user after registration
      req.login(this.convertEntityToSession(player), (err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to log in after registration" });
        }
        
        // Remove password from response
        const { password: _, ...playerWithoutPassword } = this.convertEntityToResponse(player);
        
        return res.status(201).json(playerWithoutPassword);
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Register a new game developer
   */
  async registerDeveloper(req: Request, res: Response) {
    try {
      // Validate request data
      const validatedData = insertDeveloperSchema.parse(req.body);
      
      // Create command
      const command = new RegisterDeveloperCommand(
        validatedData.username,
        validatedData.password,
        validatedData.email || null,
        validatedData.companyName || null,
        validatedData.portfolio || null,
        validatedData.displayName || null
      );
      
      // Execute command
      const developer = await this.registerDeveloperHandler.execute(command);
      
      // Login the user after registration
      req.login(this.convertEntityToSession(developer), (err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to log in after registration" });
        }
        
        // Remove password from response
        const { password: _, ...developerWithoutPassword } = this.convertEntityToResponse(developer);
        
        return res.status(201).json(developerWithoutPassword);
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  /**
   * Handle errors from registration process
   */
  private handleError(error: any, res: Response) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    console.error('Registration error:', error);
    
    if (error.message === 'Username already exists') {
      return res.status(400).json({ message: "Username already exists" });
    }
    
    return res.status(500).json({ message: "Failed to register user" });
  }
  
  /**
   * Convert user entity to session object for passport
   */
  private convertEntityToSession(entity: any) {
    return {
      id: entity.getId(),
      username: entity.getUsername(),
      role: entity.getRole(),
      email: entity.getEmail(),
      avatarUrl: entity.getAvatarUrl(),
      bio: entity.getBio(),
      displayName: entity.getDisplayName(),
      password: entity.getPasswordHash(), // Needed for passport but never exposed to client
      isVerified: entity.isUserVerified()
    };
  }
  
  /**
   * Convert user entity to response object
   */
  private convertEntityToResponse(entity: any) {
    const response = this.convertEntityToSession(entity);
    
    // Add any specific fields based on user type
    if (entity.getRole() === 'game_developer') {
      // Additional developer-specific fields
      response.companyName = entity.getCompanyName?.();
      response.portfolio = entity.getPortfolio?.();
    }
    
    return response;
  }
}