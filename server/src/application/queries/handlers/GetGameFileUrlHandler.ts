import { FileStorageFactory } from '../../../infrastructure/storage/FileStorageFactory';

/**
 * GetGameFileUrl Query Handler
 * Handles retrieving pre-signed URLs for game files
 * Following the CQRS pattern for queries
 */
export class GetGameFileUrlHandler {
  /**
   * Get a pre-signed URL for a game file
   * @param filePath The path of the file in storage
   * @param expiresInSeconds How long the URL should be valid
   * @returns The pre-signed URL
   */
  async handle(filePath: string, expiresInSeconds = 3600): Promise<string> {
    try {
      // Get the file storage service
      const fileStorageService = FileStorageFactory.createFileStorageService();
      
      // Get the storage adapter (the actual implementation)
      const storage = (fileStorageService as any).fileStorage;
      
      // Generate a pre-signed URL
      return storage.getPresignedUrl(filePath, expiresInSeconds);
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      throw new Error(`Failed to generate file URL: ${(error as Error).message}`);
    }
  }
}