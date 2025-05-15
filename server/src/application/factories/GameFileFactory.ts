import { FileStorageFactory } from '../../infrastructure/storage/FileStorageFactory';
import { UploadGameCommandHandler } from '../commands/handlers/UploadGameCommandHandler';
import { UploadThumbnailCommandHandler } from '../commands/handlers/UploadThumbnailCommandHandler';
import { UploadGameCommand } from '../commands/UploadGameCommand';
import { UploadThumbnailCommand } from '../commands/UploadThumbnailCommand';
import { File } from '../../domain/entities/File';

/**
 * Game File Factory
 * Factory class that orchestrates file upload operations for games
 * Following the Factory pattern
 */
export class GameFileFactory {
  private static instance: GameFileFactory;
  private uploadGameCommandHandler: UploadGameCommandHandler;
  private uploadThumbnailCommandHandler: UploadThumbnailCommandHandler;

  private constructor() {
    // Get the file storage service from the factory
    const fileStorageService = FileStorageFactory.createFileStorageService();
    
    // Create the command handlers with the file storage service
    this.uploadGameCommandHandler = new UploadGameCommandHandler(fileStorageService);
    this.uploadThumbnailCommandHandler = new UploadThumbnailCommandHandler(fileStorageService);
  }

  /**
   * Get the singleton instance of the factory
   */
  public static getInstance(): GameFileFactory {
    if (!GameFileFactory.instance) {
      GameFileFactory.instance = new GameFileFactory();
    }

    return GameFileFactory.instance;
  }

  /**
   * Upload a game file
   * @param fileBuffer The file buffer
   * @param originalName The original file name
   * @param mimeType The MIME type
   * @param size The file size in bytes
   * @param userId The ID of the user uploading the file
   */
  public async uploadGameFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    size: number,
    userId: number
  ): Promise<File> {
    // Create the command
    const command = new UploadGameCommand(
      fileBuffer,
      originalName,
      mimeType,
      size,
      userId
    );

    // Handle the command
    return this.uploadGameCommandHandler.handle(command);
  }

  /**
   * Upload a thumbnail file
   * @param fileBuffer The file buffer
   * @param originalName The original file name
   * @param mimeType The MIME type
   * @param size The file size in bytes
   * @param userId The ID of the user uploading the file
   */
  public async uploadThumbnail(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    size: number,
    userId: number
  ): Promise<File> {
    // Create the command
    const command = new UploadThumbnailCommand(
      fileBuffer,
      originalName,
      mimeType,
      size,
      userId
    );

    // Handle the command
    return this.uploadThumbnailCommandHandler.handle(command);
  }
}