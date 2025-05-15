import { Request, Response, NextFunction } from 'express';
import { GameSandboxService } from './GameSandboxService';

/**
 * Proxy service that handles HTTP requests to sandboxed games
 * This implements the infrastructure layer in Clean Architecture
 */
export class GameSandboxProxy {
  constructor(private readonly sandboxService: GameSandboxService) {}

  /**
   * Express middleware to handle requests to sandboxed games
   * Routes requests to the appropriate sandbox
   */
  /**
   * Create middleware function for Express to handle sandbox requests
   */
  createSandboxMiddleware() {
    return this.handleRequest;
  }

  /**
   * Request handler for sandbox requests
   */
  handleRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract the sandbox ID from the URL
      // Format: /sandbox/:sandboxId/*
      const path = req.path;
      const sandboxIdMatch = path.match(/^\/sandbox\/([^\/]+)/);
      
      if (!sandboxIdMatch) {
        return next(); // Not a sandbox URL, pass to next middleware
      }
      
      const sandboxId = sandboxIdMatch[1];
      const sandbox = this.sandboxService.getSandbox(sandboxId);
      
      if (!sandbox) {
        return res.status(404).json({
          error: 'Sandbox not found',
          message: 'The requested game environment does not exist or has expired'
        });
      }
      
      // Extract the path within the sandbox
      // This is everything after the sandbox ID
      const relativePath = path.replace(`/sandbox/${sandboxId}`, '') || '/';
      
      // Handle the request to the sandboxed game
      await this.proxyToSandbox(sandbox, relativePath, req, res);
    } catch (error) {
      console.error('Error in sandbox proxy:', error);
      res.status(500).json({
        error: 'Sandbox error',
        message: 'Failed to process the request to the sandboxed game'
      });
    }
  };
  
  /**
   * Proxies a request to the sandbox environment
   * 
   * @param sandbox The sandbox instance
   * @param path The path within the sandbox
   * @param req The original request
   * @param res The response to write to
   */
  private async proxyToSandbox(
    sandbox: any, 
    path: string, 
    req: Request, 
    res: Response
  ): Promise<void> {
    // In a real implementation, this would proxy the request to the actual sandbox
    // For now, we'll just return a successful response with information
    
    const data = {
      sandboxId: sandbox.getId ? sandbox.getId() : 'unknown',
      path,
      method: req.method,
      message: 'This is a simulated response from the sandboxed game',
      timestamp: new Date().toISOString(),
      gameId: sandbox.gameId ? (typeof sandbox.gameId === 'object' && sandbox.gameId.toString ? sandbox.gameId.toString() : sandbox.gameId) : 'unknown'
    };
    
    if (path.endsWith('.html') || path === '/') {
      res.setHeader('Content-Type', 'text/html');
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Sandboxed Game</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px;
                background-color: #f7f7f7;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
              }
              .sandbox-info {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                padding: 20px;
                max-width: 600px;
                width: 100%;
              }
              h1 { color: #333; }
              pre { 
                background-color: #f1f1f1; 
                padding: 15px;
                border-radius: 4px;
                overflow: auto;
              }
            </style>
          </head>
          <body>
            <div class="sandbox-info">
              <h1>Sandboxed Game Environment</h1>
              <p>This is a simulated sandbox environment for game ID: ${data.gameId}</p>
              <p>The real implementation would load the actual game files here.</p>
              <h2>Request Information:</h2>
              <pre>${JSON.stringify(data, null, 2)}</pre>
            </div>
          </body>
        </html>
      `);
    } else if (path.endsWith('.json')) {
      res.json(data);
    } else {
      // For other file types, just return JSON data for demonstration
      res.json(data);
    }
  }
}