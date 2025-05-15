import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import * as crypto from 'crypto';
import { FileUpload } from '../../application/commands/SubmitGameCommand';
import { extract } from 'node-stream-zip';

/**
 * AssetManager service for handling game-related assets
 * Part of the infrastructure layer in Clean Architecture
 */
export class AssetManager {
  private readonly assetsBasePath: string;
  private readonly tempDir: string;
  
  constructor(assetsBasePath: string = path.join(process.cwd(), 'uploads')) {
    this.assetsBasePath = assetsBasePath;
    this.tempDir = os.tmpdir();
  }

  /**
   * Upload an image file
   */
  async uploadImage(
    file: FileUpload,
    type: 'icon' | 'header' | 'screenshot',
    gameId: string
  ): Promise<string> {
    try {
      // Generate a unique filename
      const filename = this.generateUniqueFilename(file.originalName);
      
      // Determine the destination path
      const typePath = type === 'icon' ? 'icons' : type === 'header' ? 'headers' : 'screenshots';
      const destPath = path.join(this.assetsBasePath, 'games', gameId, 'images', typePath);
      
      // Ensure directory exists
      await fs.mkdir(destPath, { recursive: true });
      
      // Copy the file to the destination
      const destFilePath = path.join(destPath, filename);
      await fs.copyFile(file.path, destFilePath);
      
      // Return the relative URL path
      return `/uploads/games/${gameId}/images/${typePath}/${filename}`;
    } catch (error) {
      console.error(`Error uploading ${type} image:`, error);
      throw new Error(`Failed to upload ${type} image: ${error.message}`);
    }
  }

  /**
   * Upload a video file
   */
  async uploadVideo(file: FileUpload, gameId: string): Promise<string> {
    try {
      // Generate a unique filename
      const filename = this.generateUniqueFilename(file.originalName);
      
      // Determine the destination path
      const destPath = path.join(this.assetsBasePath, 'games', gameId, 'videos');
      
      // Ensure directory exists
      await fs.mkdir(destPath, { recursive: true });
      
      // Copy the file to the destination
      const destFilePath = path.join(destPath, filename);
      await fs.copyFile(file.path, destFilePath);
      
      // Return the relative URL path
      return `/uploads/games/${gameId}/videos/${filename}`;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw new Error(`Failed to upload video: ${error.message}`);
    }
  }

  /**
   * Extract and store a game bundle
   */
  async extractGameBundle(file: FileUpload, gameId: string): Promise<string[]> {
    try {
      // Determine if this is a ZIP file or a single HTML file
      const isZip = file.mimeType === 'application/zip' || 
                    file.originalName.toLowerCase().endsWith('.zip');
      
      // Determine the destination path
      const destPath = path.join(this.assetsBasePath, 'games', gameId, 'bundles', this.generateTimestamp());
      
      // Ensure directory exists
      await fs.mkdir(destPath, { recursive: true });
      
      if (isZip) {
        // Handle ZIP file
        const extractedFiles = await this.extractZipBundle(file.path, destPath);
        return extractedFiles;
      } else {
        // Handle single file (HTML)
        const filename = this.generateUniqueFilename(file.originalName);
        const destFilePath = path.join(destPath, filename);
        await fs.copyFile(file.path, destFilePath);
        return [destFilePath];
      }
    } catch (error) {
      console.error('Error extracting game bundle:', error);
      throw new Error(`Failed to extract game bundle: ${error.message}`);
    }
  }

  /**
   * Extract a ZIP bundle
   */
  private async extractZipBundle(zipPath: string, destPath: string): Promise<string[]> {
    try {
      // Extract the zip file
      await extract({ path: zipPath, outPath: destPath });
      
      // Get all extracted files
      const files = await this.getAllFiles(destPath);
      return files;
    } catch (error) {
      console.error('Error extracting ZIP bundle:', error);
      throw new Error(`Failed to extract ZIP bundle: ${error.message}`);
    }
  }

  /**
   * Get all files recursively in a directory
   */
  private async getAllFiles(dirPath: string, arrayOfFiles: string[] = []): Promise<string[]> {
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        await this.getAllFiles(fullPath, arrayOfFiles);
      } else {
        arrayOfFiles.push(fullPath);
      }
    }
    
    return arrayOfFiles;
  }

  /**
   * Generate a unique filename based on the original name
   */
  private generateUniqueFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const hash = crypto.randomBytes(8).toString('hex');
    return `${name}-${hash}${ext}`;
  }

  /**
   * Generate a timestamp string for folder naming
   */
  private generateTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }
}