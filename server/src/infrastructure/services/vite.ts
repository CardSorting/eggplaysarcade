import express, { Express } from 'express';
import { Server } from 'http';
import path from 'path';
import fs from 'fs';

/**
 * Logs a message with a source prefix
 */
export function log(message: string, source = 'express'): void {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} [${source}] ${message}`);
}

/**
 * Sets up Vite middleware for development
 */
export async function setupVite(app: Express, server: Server): Promise<void> {
  // Load Vite module dynamically to avoid dependency in production
  const { createServer: createViteServer } = await import('vite');
  
  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
    optimizeDeps: {
      // Force include packages that use Vite's pre-bundle optimization
      include: ['@tanstack/react-query', 'wouter', 'react-helmet', 'react-hook-form'],
    }
  });
  
  // Use Vite's connect instance as middleware
  app.use(vite.middlewares);
}

/**
 * Serves static files in production
 */
export function serveStatic(app: Express): void {
  const clientDistPath = path.resolve('./client/dist');
  
  // Check if client dist directory exists
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    
    // Serve index.html for all other routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  } else {
    log('Warning: client/dist directory not found. Make sure to build the client first.', 'express');
  }
}