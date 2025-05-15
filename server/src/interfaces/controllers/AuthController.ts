import { Request, Response } from "express";
import { RegisterPlayerHandler } from "../../application/commands/handlers/RegisterPlayerHandler";
import { RegisterDeveloperHandler } from "../../application/commands/handlers/RegisterDeveloperHandler";
import { RegisterPlayerCommand } from "../../application/commands/RegisterPlayerCommand";
import { RegisterDeveloperCommand } from "../../application/commands/RegisterDeveloperCommand";
import { User } from "../../../../shared/schema";

/**
 * Auth Controller
 * Following Clean Architecture, this controller handles HTTP requests and responses
 * related to authentication and transforms them into domain commands
 */
export class AuthController {
  constructor(
    private readonly registerPlayerHandler: RegisterPlayerHandler,
    private readonly registerDeveloperHandler: RegisterDeveloperHandler
  ) {}

  /**
   * Register a new player
   */
  async registerPlayer(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      if (!req.body.username || !req.body.password) {
        res.status(400).json({ message: "Username and password are required" });
        return;
      }

      // Create command from request
      const command = new RegisterPlayerCommand(
        req.body.username,
        req.body.password,
        req.body.email || null,
        req.body.displayName || null,
        req.body.avatarUrl || null,
        req.body.bio || null
      );

      // Handle command
      const playerEntity = await this.registerPlayerHandler.handle(command);

      // Login the user (set session)
      const playerData: User = {
        id: playerEntity.getId() as number,
        username: playerEntity.getUsername(),
        role: playerEntity.getRole(),
        email: playerEntity.getEmail(),
        avatarUrl: playerEntity.getAvatarUrl(),
        bio: playerEntity.getBio(),
        displayName: playerEntity.getDisplayName(),
        password: playerEntity.getPasswordHash(), // Needed for passport
        isVerified: playerEntity.isUserVerified(),
        createdAt: playerEntity.getCreatedAt(),
        lastLogin: playerEntity.getLastLogin()
      };

      req.login(playerData, (err) => {
        if (err) {
          res.status(500).json({ message: "Failed to login after registration" });
          return;
        }
        
        // Remove sensitive data before sending response
        const { password, ...playerResponse } = playerData;
        res.status(201).json(playerResponse);
      });

    } catch (error: any) {
      res.status(500).json({ message: `Failed to register player: ${error.message}` });
    }
  }

  /**
   * Register a new developer
   */
  async registerDeveloper(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      if (!req.body.username || !req.body.password) {
        res.status(400).json({ message: "Username and password are required" });
        return;
      }

      // Create command from request
      const command = new RegisterDeveloperCommand(
        req.body.username,
        req.body.password,
        req.body.email || null,
        req.body.displayName || null,
        req.body.companyName || null,
        req.body.portfolio || null,
        req.body.avatarUrl || null,
        req.body.bio || null
      );

      // Handle command
      const developerEntity = await this.registerDeveloperHandler.handle(command);

      // Login the user (set session)
      const developerData: User = {
        id: developerEntity.getId() as number,
        username: developerEntity.getUsername(),
        role: developerEntity.getRole(),
        email: developerEntity.getEmail(),
        avatarUrl: developerEntity.getAvatarUrl(),
        bio: developerEntity.getBio(),
        displayName: developerEntity.getDisplayName(),
        password: developerEntity.getPasswordHash(), // Needed for passport
        isVerified: developerEntity.isUserVerified(),
        createdAt: developerEntity.getCreatedAt(),
        lastLogin: developerEntity.getLastLogin(),
        // Additional developer fields
        companyName: developerEntity.getCompanyName(),
        portfolio: developerEntity.getPortfolio()
      };

      req.login(developerData, (err) => {
        if (err) {
          res.status(500).json({ message: "Failed to login after registration" });
          return;
        }
        
        // Remove sensitive data before sending response
        const { password, ...developerResponse } = developerData;
        res.status(201).json(developerResponse);
      });

    } catch (error: any) {
      res.status(500).json({ message: `Failed to register developer: ${error.message}` });
    }
  }
}