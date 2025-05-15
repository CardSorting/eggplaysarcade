import { IFileStorage } from '../../domain/interfaces/IFileStorage';
import { BackblazeB2Storage } from './BackblazeB2Storage';
import { FileStorageService } from '../../application/services/FileStorageService';
import fs from 'fs';
import path from 'path';

/**
 * Local File Storage implementation for fallback/testing
 */
class LocalFileStorage implements IFileStorage {
  private readonly baseDir: string;
  private readonly baseUrl: string;
  
  constructor() {
    this.baseDir = path.join(process.cwd(), 'uploads');
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com/uploads' 
      : 'http://localhost:5000/uploads';
    
    // Ensure directories exist
    this.ensureDirectoryExists(path.join(this.baseDir, 'games'));
    this.ensureDirectoryExists(path.join(this.baseDir, 'thumbnails'));
  }
  
  private ensureDirectoryExists(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    const filePath = path.join(this.baseDir, fileName);
    const directory = path.dirname(filePath);
    
    this.ensureDirectoryExists(directory);
    
    await fs.promises.writeFile(filePath, fileBuffer);
    
    // Store metadata in a separate .meta file if needed
    if (metadata && Object.keys(metadata).length > 0) {
      await fs.promises.writeFile(
        `${filePath}.meta`, 
        JSON.stringify(metadata, null, 2)
      );
    }
    
    return `${this.baseUrl}/${fileName}`;
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const fileName = fileUrl.replace(`${this.baseUrl}/`, '');
      const filePath = path.join(this.baseDir, fileName);
      
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        
        // Delete metadata file if it exists
        const metaPath = `${filePath}.meta`;
        if (fs.existsSync(metaPath)) {
          await fs.promises.unlink(metaPath);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting local file:', error);
      return false;
    }
  }

  async getPresignedUrl(fileUrl: string, expiresInSeconds: number): Promise<string> {
    // Local files don't need pre-signed URLs, just return the URL
    return fileUrl;
  }
}

/**
 * Factory class for creating file storage instances
 * Follows the Factory Method pattern
 */
export class FileStorageFactory {
  /**
   * Creates and returns a file storage service based on configuration
   */
  static createFileStorageService(): FileStorageService {
    let fileStorage: IFileStorage;
    
    // Check if B2 credentials are available
    if (process.env.B2_APPLICATION_KEY_ID && process.env.B2_APPLICATION_KEY) {
      try {
        // Use Backblaze B2 Storage
        fileStorage = new BackblazeB2Storage();
        console.log('Using Backblaze B2 storage for file uploads');
      } catch (error) {
        console.error('Failed to initialize Backblaze B2 storage:', error);
        console.log('Falling back to local file storage');
        fileStorage = new LocalFileStorage();
      }
    } else {
      // Use local file storage
      console.log('Using local file storage for uploads (B2 credentials not found)');
      fileStorage = new LocalFileStorage();
    }
    
    // Return the file storage service with the appropriate storage implementation
    return new FileStorageService(fileStorage);
  }
}