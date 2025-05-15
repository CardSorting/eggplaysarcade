import { Router, Request, Response } from 'express';
import { GameSandboxService } from './GameSandboxService';
import { storage } from '../../../storage';

/**
 * Game Sandbox Proxy Service
 * 
 * Creates a route handler for proxying requests to sandboxed games
 * and manages security headers and restrictions
 */
export class GameSandboxProxy {
  private readonly sandboxService: GameSandboxService;

  constructor(sandboxService: GameSandboxService) {
    this.sandboxService = sandboxService;
  }

  /**
   * Create middleware for serving sandboxed games
   */
  createSandboxMiddleware() {
    const router = Router();

    // Serve a specific sandboxed game
    router.get('/:sandboxId', async (req: Request, res: Response) => {
      const { sandboxId } = req.params;
      
      try {
        // Get the game associated with this sandbox
        const gameId = this.sandboxService.getGameId(sandboxId);
        
        if (!gameId) {
          return res.status(404).send('Sandbox not found or expired');
        }
        
        // Get game details
        const game = await storage.getGameById(gameId);
        
        if (!game) {
          return res.status(404).send('Game not found');
        }
        
        // Increment play count
        await storage.updateGamePlayers(gameId, 1);
        
        // Generate HTML for the sandbox iframe
        const html = this.generateSandboxHtml(sandboxId, game.gameUrl);
        
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Security-Policy', this.generateCSP());
        return res.send(html);
      } catch (error) {
        console.error('Error serving sandbox game:', error);
        return res.status(500).send('An error occurred while loading the game');
      }
    });

    // Health check endpoint for a sandbox
    router.get('/:sandboxId/health', async (req: Request, res: Response) => {
      const { sandboxId } = req.params;
      const sandbox = this.sandboxService.getSandbox(sandboxId);
      
      if (!sandbox) {
        return res.status(404).json({ status: 'not_found' });
      }
      
      return res.json({
        status: 'active',
        created: sandbox.created,
        lastAccessed: sandbox.accessed
      });
    });

    // Metrics endpoint for a sandbox
    router.get('/:sandboxId/metrics', async (req: Request, res: Response) => {
      const { sandboxId } = req.params;
      const sandbox = this.sandboxService.getSandbox(sandboxId);
      
      if (!sandbox) {
        return res.status(404).json({ status: 'not_found' });
      }
      
      return res.json({
        id: sandbox.id,
        gameId: sandbox.gameId,
        resourceUsage: sandbox.resourceUsage
      });
    });

    return router;
  }

  /**
   * Generate HTML for the sandbox iframe
   */
  private generateSandboxHtml(sandboxId: string, gameUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Game Sandbox</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #111827;
      display: flex;
      flex-direction: column;
    }
    .navbar {
      background-color: #1f2937;
      color: white;
      padding: 8px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .back-button {
      background-color: #4f46e5;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    .back-button:hover {
      background-color: #4338ca;
    }
    .sandbox-container {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 16px;
    }
    iframe {
      border: none;
      width: 100%;
      height: 100%;
      max-width: 1024px;
      max-height: 768px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .status {
      color: #9ca3af;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="navbar">
    <button class="back-button" onclick="window.close()">Exit Game</button>
    <div class="status">Sandbox ID: ${sandboxId}</div>
  </div>
  <div class="sandbox-container">
    <iframe
      src="${gameUrl}"
      sandbox="allow-scripts allow-same-origin"
      allow="gamepad; fullscreen"
    ></iframe>
  </div>
  <script>
    // Sandbox monitoring script
    const reportResourceUsage = () => {
      const memory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      
      fetch('/sandbox/${sandboxId}/update-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memoryUsage: memory,
          networkRequests: performance.getEntriesByType('resource').length
        })
      }).catch(err => console.error('Failed to report metrics:', err));
    };
    
    // Report usage every 30 seconds
    setInterval(reportResourceUsage, 30000);
    
    // Report on unload
    window.addEventListener('beforeunload', reportResourceUsage);
  </script>
</body>
</html>
    `.trim();
  }

  /**
   * Generate Content Security Policy for the sandbox
   */
  private generateCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self'",
      "connect-src 'self'",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline'",
      "frame-src 'self'",
      "worker-src 'self' blob:",
      "media-src 'self' data: blob:",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ');
  }
}