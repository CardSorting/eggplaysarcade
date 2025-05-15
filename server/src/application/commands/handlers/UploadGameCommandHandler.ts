import { UploadGameCommand } from '../UploadGameCommand';
import { FileStorageService } from '../../services/FileStorageService';
import { File } from '../../../domain/entities/File';

/**
 * Upload Game Command Handler
 * Handles the logic for uploading a game file
 * Following the Command Handler pattern (part of CQRS)
 */
export class UploadGameCommandHandler {
  constructor(private readonly fileStorageService: FileStorageService) {}

  /**
   * Handle the upload game command
   * @param command The upload game command
   * @returns Promise with the uploaded File entity
   */
  async handle(command: UploadGameCommand): Promise<File> {
    try {
      // Upload the game file
      const file = await this.fileStorageService.uploadGameFile(
        command.fileBuffer,
        command.originalName,
        command.mimeType,
        command.size
      );

      // Return the file entity
      return file;
    } catch (error) {
      console.error('Error handling upload game command:', error);
      throw error;
    }
  }
}