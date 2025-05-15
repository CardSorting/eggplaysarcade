import { Request, Response } from 'express';
import { UploadGameCommand } from '../../application/commands/UploadGameCommand';
import { CreateSandboxCommand } from '../../application/commands/CreateSandboxCommand';
import { DeploySandboxedGameCommand } from '../../application/commands/DeploySandboxedGameCommand';
import { GetSandboxStatusQuery } from '../../application/queries/GetSandboxStatusQuery';
import { UploadGameCommandHandler } from '../../application/commands/handlers/UploadGameCommandHandler';
import { CreateSandboxCommandHandler } from '../../application/commands/handlers/CreateSandboxCommandHandler';
import { DeploySandboxedGameCommandHandler } from '../../application/commands/handlers/DeploySandboxedGameCommandHandler';
import { GetSandboxStatusQueryHandler } from '../../application/queries/handlers/GetSandboxStatusQueryHandler';
import { SecurityLevel } from '../../domain/value-objects/SecurityLevel';

/**
 * Controller for managing game sandboxes
 * Part of the interface layer in Clean Architecture
 */
export class GameSandboxController {
  constructor(
    private readonly uploadGameCommandHandler: UploadGameCommandHandler,
    private readonly createSandboxCommandHandler: CreateSandboxCommandHandler,
    private readonly deploySandboxedGameCommandHandler: DeploySandboxedGameCommandHandler,
    private readonly getSandboxStatusQueryHandler: GetSandboxStatusQueryHandler
  ) {}

  /**
   * Upload a game bundle
   */
  async uploadGame(req: Request, res: Response): Promise<void> {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        res.status(400).json({ error: 'No files were uploaded' });
        return;
      }

      // Extract user ID from authenticated session
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Extract game ID and entry point from request
      const { gameId, entryPoint, metadata } = req.body;
      
      if (!gameId || !entryPoint) {
        res.status(400).json({ error: 'Game ID and entry point are required' });
        return;
      }

      // Convert uploaded files to the expected format
      const files = Array.isArray(req.files) 
        ? req.files 
        : Object.values(req.files || {}).flat();
      
      const uploadedFiles = files.map(file => ({
        path: file.path,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      }));

      // Create the command
      const command: UploadGameCommand = {
        gameId,
        userId,
        files: uploadedFiles,
        entryPoint,
        metadata: metadata ? JSON.parse(metadata) : {
          hasExternalAPIs: false,
          hasServerSideCode: false,
          thirdPartyLibraries: []
        }
      };

      // Handle the command
      const bundleId = await this.uploadGameCommandHandler.execute(command);

      // Return the ID of the newly created bundle
      res.status(200).json({ bundleId });
    } catch (error) {
      console.error('Error uploading game:', error);
      res.status(500).json({ error: 'Failed to upload game' });
    }
  }

  /**
   * Create a sandbox for a game
   */
  async createSandbox(req: Request, res: Response): Promise<void> {
    try {
      // Extract user ID from authenticated session
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Extract required parameters
      const { gameId, gameBundleId, securityLevel, expiresInHours, containerImage } = req.body;
      
      if (!gameId || !gameBundleId) {
        res.status(400).json({ error: 'Game ID and game bundle ID are required' });
        return;
      }

      // Create the command
      const command: CreateSandboxCommand = {
        gameId,
        gameBundleId,
        securityLevel: securityLevel || SecurityLevel.MEDIUM,
        expiresInHours,
        containerImage
      };

      // Handle the command
      const sandboxId = await this.createSandboxCommandHandler.execute(command);

      // Return the ID of the newly created sandbox
      res.status(200).json({ sandboxId });
    } catch (error) {
      console.error('Error creating sandbox:', error);
      res.status(500).json({ error: 'Failed to create sandbox' });
    }
  }

  /**
   * Deploy a game to a sandbox
   */
  async deploySandboxedGame(req: Request, res: Response): Promise<void> {
    try {
      // Extract user ID from authenticated session
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Extract required parameters
      const { sandboxId, gameId, gameBundleId } = req.body;
      
      if (!sandboxId || !gameId || !gameBundleId) {
        res.status(400).json({ error: 'Sandbox ID, game ID, and game bundle ID are required' });
        return;
      }

      // Create the command
      const command: DeploySandboxedGameCommand = {
        sandboxId,
        gameId,
        gameBundleId
      };

      // Handle the command
      await this.deploySandboxedGameCommandHandler.execute(command);

      // Return success
      res.status(200).json({ success: true, message: 'Game deployed successfully' });
    } catch (error) {
      console.error('Error deploying game to sandbox:', error);
      res.status(500).json({ error: 'Failed to deploy game to sandbox' });
    }
  }

  /**
   * Get the status of a sandbox
   */
  async getSandboxStatus(req: Request, res: Response): Promise<void> {
    try {
      // Extract user ID from authenticated session
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Extract required parameters
      const { sandboxId } = req.params;
      
      if (!sandboxId) {
        res.status(400).json({ error: 'Sandbox ID is required' });
        return;
      }

      // Create the query
      const query: GetSandboxStatusQuery = {
        sandboxId
      };

      // Handle the query
      const status = await this.getSandboxStatusQueryHandler.execute(query);
      
      if (!status) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }

      // Return the status
      res.status(200).json(status);
    } catch (error) {
      console.error('Error getting sandbox status:', error);
      res.status(500).json({ error: 'Failed to get sandbox status' });
    }
  }

  /**
   * Play a game from the sandbox - generates a token and redirects to the game iframe
   */
  async playSandboxedGame(req: Request, res: Response): Promise<void> {
    try {
      // Extract sandbox ID from request
      const { sandboxId } = req.params;
      
      if (!sandboxId) {
        res.status(400).json({ error: 'Sandbox ID is required' });
        return;
      }

      // Create the query to get sandbox status
      const query: GetSandboxStatusQuery = {
        sandboxId
      };

      // Handle the query
      const status = await this.getSandboxStatusQueryHandler.execute(query);
      
      if (!status) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }

      // Generate a secure session token for the game
      const sessionToken = this.generateSecureToken();
      
      // Construct the URL with security parameters
      const gameUrl = status.publicUrl;
      const secureGameUrl = `https://${gameUrl}?token=${sessionToken}&sandboxId=${sandboxId}`;
      
      // Return the URL and security headers
      res.status(200).json({
        gameUrl: secureGameUrl,
        securityHeaders: this.getSecurityHeaders(),
        sandboxAttributes: this.getSandboxAttributes()
      });
    } catch (error) {
      console.error('Error preparing game for play:', error);
      res.status(500).json({ error: 'Failed to prepare game for play' });
    }
  }

  /**
   * Generate a secure token for game sessions
   */
  private generateSecureToken(): string {
    // In a real implementation, this would generate a cryptographically secure token
    // with an expiration time, signed with a secret key
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Get recommended security headers for the iframe
   */
  private getSecurityHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'self'",
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
  }

  /**
   * Get recommended sandbox attributes for the iframe
   */
  private getSandboxAttributes(): string {
    return 'allow-scripts allow-same-origin allow-forms';
  }
}