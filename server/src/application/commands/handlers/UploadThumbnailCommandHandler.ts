import { UploadThumbnailCommand } from '../UploadThumbnailCommand';
import { FileStorageService } from '../../services/FileStorageService';
import { File } from '../../../domain/entities/File';

/**
 * Upload Thumbnail Command Handler
 * Handles the logic for uploading a thumbnail file
 * Following the Command Handler pattern (part of CQRS)
 */
export class UploadThumbnailCommandHandler {
  constructor(private readonly fileStorageService: FileStorageService) {}

  /**
   * Handle the upload thumbnail command
   * @param command The upload thumbnail command
   * @returns Promise with the uploaded File entity
   */
  async handle(command: UploadThumbnailCommand): Promise<File> {
    try {
      // Upload the thumbnail file
      const file = await this.fileStorageService.uploadThumbnail(
        command.fileBuffer,
        command.originalName,
        command.mimeType,
        command.size
      );

      // Return the file entity
      return file;
    } catch (error) {
      console.error('Error handling upload thumbnail command:', error);
      throw error;
    }
  }
}