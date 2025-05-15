import express, { Request, Response, NextFunction } from 'express';
import { GameSandboxService } from './GameSandboxService';

/**
 * Game Sandbox Proxy Service
 * 
 * Creates a route handler for proxying requests to sandboxed games
 * and manages security headers and restrictions
 */
export class GameSandboxProxy {
  private readonly sandboxService: GameSandboxService;
  
  constructor(sandboxService: GameSandboxService = new GameSandboxService()) {
    this.sandboxService = sandboxService;
  }
  
  /**
   * Create middleware for serving sandboxed games
   */
  createSandboxMiddleware() {
    const router = express.Router();
    
    // Sandbox entry point
    router.get('/:gameId', async (req: Request, res: Response) => {
      const gameId = req.params.gameId;
      
      try {
        // Simulate retrieving the game and sandbox data
        console.log(`Launching sandbox for game: ${gameId}`);
        
        // Generate HTML for the sandboxed game
        const html = this.generateSandboxHtml(gameId);
        
        // Set security headers
        res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;");
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        res.send(html);
      } catch (error) {
        console.error(`Error serving sandbox for game ${gameId}:`, error);
        res.status(500).send('Failed to launch game in sandbox');
      }
    });
    
    // Health check for sandbox
    router.get('/:gameId/health', async (req: Request, res: Response) => {
      const sandboxId = req.params.gameId;
      
      try {
        // Check if sandbox is running
        const isHealthy = await this.sandboxService.checkSandboxHealth(sandboxId);
        
        if (isHealthy) {
          res.json({ status: 'ok' });
        } else {
          res.status(503).json({ status: 'unhealthy' });
        }
      } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to check sandbox health' });
      }
    });
    
    // Game metrics endpoint
    router.get('/:gameId/metrics', async (req: Request, res: Response) => {
      const sandboxId = req.params.gameId;
      
      try {
        // Get sandbox metrics
        const metrics = await this.sandboxService.getSandboxMetrics(sandboxId);
        
        if (metrics) {
          res.json(metrics);
        } else {
          res.status(404).json({ error: 'No metrics available' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Failed to get sandbox metrics' });
      }
    });
    
    return router;
  }
  
  /**
   * Generate HTML for the sandbox iframe
   */
  private generateSandboxHtml(gameId: string): string {
    // This is a simplified example
    // In a real implementation, this would fetch the actual game content
    // from a secure storage location and inject it into a sandboxed iframe
    
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
            background-color: #000;
            display: flex;
            flex-direction: column;
            color: white;
            font-family: system-ui, -apple-system, sans-serif;
          }
          .sandbox-header {
            background-color: rgba(0, 0, 0, 0.7);
            padding: 8px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .sandbox-body {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
          }
          .game-container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #1a1a1a;
          }
          .fullscreen-btn {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
          }
          .fullscreen-btn:hover {
            background: rgba(255, 255, 255, 0.2);
          }
          .game-frame {
            width: 100%;
            height: 100%;
            border: none;
          }
          @keyframes rotateLoading {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .loading {
            position: absolute;
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255, 255, 255, 0.2);
            border-top: 5px solid #3498db;
            border-radius: 50%;
            animation: rotateLoading 1s linear infinite;
          }
          .game-mock {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 20px;
          }
          .game-title {
            font-size: 32px;
            margin-bottom: 20px;
            background: linear-gradient(45deg, #6b46c1, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .game-subtitle {
            opacity: 0.7;
            max-width: 600px;
            margin-bottom: 30px;
          }
          .game-message {
            font-size: 18px;
            margin-top: 40px;
            max-width: 80%;
          }
          .game-id {
            color: #6b46c1;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="sandbox-header">
          <div>Secure Game Sandbox</div>
          <button class="fullscreen-btn" id="fullscreenBtn">Fullscreen</button>
        </div>
        <div class="sandbox-body">
          <div class="game-container">
            <div class="game-mock">
              <h1 class="game-title">Secure Game Sandbox</h1>
              <p class="game-subtitle">This is a demonstration of the game sandbox environment. In a real implementation, the game would be loaded securely from its own container.</p>
              <div class="loading"></div>
              <p class="game-message">
                Game <span class="game-id">${gameId}</span> is running in a secure, sandboxed environment with isolated resources and security restrictions.
              </p>
            </div>
          </div>
        </div>
        <script>
          // Simple fullscreen toggle
          document.getElementById('fullscreenBtn').addEventListener('click', function() {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
              });
            } else {
              if (document.exitFullscreen) {
                document.exitFullscreen();
              }
            }
          });
          
          // Simulate game progress events
          const events = [
            { time: 2000, message: 'Loading game assets...' },
            { time: 4000, message: 'Initializing game environment...' },
            { time: 6000, message: 'Establishing secure sandbox...' },
            { time: 8000, message: 'Game started successfully in secure sandbox!' }
          ];
          
          const gameMessage = document.querySelector('.game-message');
          events.forEach(event => {
            setTimeout(() => {
              gameMessage.innerHTML = event.message;
            }, event.time);
          });
          
          // Simulated game metrics reporting
          setInterval(() => {
            const metrics = {
              memoryUsage: Math.random() * 50 + 30, // 30-80%
              cpuUsage: Math.random() * 40 + 20,    // 20-60%
              networkUsage: Math.random() * 30 + 10 // 10-40%
            };
            console.log('Game sandbox metrics:', metrics);
          }, 5000);
        </script>
      </body>
      </html>
    `;
  }
}