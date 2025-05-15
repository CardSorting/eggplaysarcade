import { Request, Response } from 'express';
import { SandboxRepository } from '../../domain/repositories/SandboxRepository';
import { SandboxStatus } from '../../domain/entities/Sandbox';

/**
 * GameProxyService provides secure proxying of sandboxed game content
 * to the end user, adding necessary security headers and restrictions
 */
export class GameProxyService {
  constructor(
    private readonly sandboxRepository: SandboxRepository,
    private readonly containerService: ContainerService
  ) {}

  /**
   * Middleware to serve a game from a sandbox securely
   */
  proxyGameMiddleware = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId, token } = req.query;
      
      // Validate inputs
      if (!sandboxId || typeof sandboxId !== 'string') {
        res.status(400).send('Invalid sandbox ID');
        return;
      }
      
      if (!token || typeof token !== 'string') {
        res.status(400).send('Invalid token');
        return;
      }
      
      // Validate token (in real implementation, would verify against session store)
      if (!this.validateToken(token, sandboxId)) {
        res.status(401).send('Invalid or expired token');
        return;
      }
      
      // Get the sandbox
      const sandbox = await this.sandboxRepository.findById(sandboxId);
      if (!sandbox) {
        res.status(404).send('Sandbox not found');
        return;
      }
      
      // Check if sandbox is running
      if (sandbox.status !== SandboxStatus.RUNNING) {
        res.status(503).send('Sandbox is not running');
        return;
      }
      
      // Check sandbox health
      if (!sandbox.isHealthy()) {
        res.status(503).send('Sandbox is not healthy');
        return;
      }
      
      // Add security headers
      this.addSecurityHeaders(res);
      
      // Increment active session count
      sandbox.incrementActiveSessionCount();
      await this.sandboxRepository.updateActiveSessionCount(
        sandbox.id, 
        sandbox.activeSessionCount
      );
      
      // For a real implementation, we would proxy the request to the container
      // Here we simulate by generating a secure HTML wrapper
      this.sendSecureGameWrapper(res, sandbox.publicUrl, token);
    } catch (error) {
      console.error('Error serving game:', error);
      res.status(500).send('Failed to serve game');
    }
  };
  
  /**
   * Middleware to handle game asset requests
   */
  proxyGameAssetMiddleware = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sandboxId, assetPath, token } = req.params;
      
      // Validate token
      if (!this.validateToken(token, sandboxId)) {
        res.status(401).send('Invalid or expired token');
        return;
      }
      
      // Get the sandbox
      const sandbox = await this.sandboxRepository.findById(sandboxId);
      if (!sandbox) {
        res.status(404).send('Sandbox not found');
        return;
      }
      
      // Check if sandbox is running
      if (sandbox.status !== SandboxStatus.RUNNING) {
        res.status(503).send('Sandbox is not running');
        return;
      }
      
      // For a real implementation, we would proxy the asset request to the container
      // For now, we'll just return a generic response
      res.send(`Asset content for ${assetPath} from sandbox ${sandboxId}`);
    } catch (error) {
      console.error('Error serving game asset:', error);
      res.status(500).send('Failed to serve game asset');
    }
  };
  
  /**
   * Validate a game session token
   */
  private validateToken(token: string, sandboxId: string): boolean {
    // In a real implementation, this would verify the token against a session store
    // and check if it's expired or revoked
    // For simplicity, we'll just validate that the token is not empty
    return token.length > 10;
  }
  
  /**
   * Add security headers to the response
   */
  private addSecurityHeaders(res: Response): void {
    // Content Security Policy to restrict what the game can load
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'self'"
    );
    
    // Prevent the game from being loaded in an iframe elsewhere
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Don't send referrer information to external sites
    res.setHeader('Referrer-Policy', 'no-referrer');
    
    // Restrict feature access
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()'
    );
  }
  
  /**
   * Send a secure HTML wrapper for the game
   */
  private sendSecureGameWrapper(res: Response, gameUrl: string, token: string): void {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sandboxed Game</title>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          #game-container {
            width: 100%;
            height: 100%;
            border: none;
          }
          #error-container {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            text-align: center;
            padding-top: 20%;
            font-family: Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        <!-- Sandboxed iframe for the game -->
        <iframe 
          id="game-container"
          src="https://${gameUrl}?token=${token}"
          sandbox="allow-scripts allow-same-origin"
          allow="fullscreen"
        ></iframe>
        
        <!-- Error container -->
        <div id="error-container">
          <h2>An error occurred while loading the game</h2>
          <p id="error-message">Please try again later.</p>
          <button onclick="window.location.reload()">Retry</button>
        </div>
        
        <script>
          // Monitor the iframe for errors
          window.addEventListener('message', function(event) {
            // Verify that the message came from the game iframe
            if (event.origin === 'https://${gameUrl}') {
              if (event.data.type === 'error') {
                document.getElementById('error-message').textContent = event.data.message;
                document.getElementById('error-container').style.display = 'block';
              }
            }
          });
          
          // Handle iframe errors
          const iframe = document.getElementById('game-container');
          iframe.onerror = function() {
            document.getElementById('error-container').style.display = 'block';
          };
        </script>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}

/**
 * Interface for the container service
 * This would be implemented in the infrastructure layer
 */
interface ContainerService {
  getContainerUrl(sandboxId: string): Promise<string>;
}