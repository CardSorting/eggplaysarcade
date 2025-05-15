import { v4 as uuidv4 } from 'uuid';
import { IFileStorage } from '../../domain/interfaces/IFileStorage';
import { File } from '../../domain/entities/File';

/**
 * FileStorageService
 * Application service that coordinates file storage operations
 * Following the Single Responsibility Principle (SOLID)
 */
export class FileStorageService {
  constructor(private readonly fileStorage: IFileStorage) {}

  /**
   * Uploads a game file and returns the File entity
   * @param fileBuffer The file buffer
   * @param originalName The original file name
   * @param mimeType The MIME type
   * @param size The file size in bytes
   */
  async uploadGameFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    size: number
  ): Promise<File> {
    // Validate the file is a valid game file
    if (mimeType !== 'text/html' && mimeType !== 'application/zip') {
      throw new Error('Invalid game file type. Only HTML and ZIP files are allowed.');
    }

    // Validate file size (50MB max)
    const MAX_GAME_FILE_SIZE = 50 * 1024 * 1024;
    if (size > MAX_GAME_FILE_SIZE) {
      throw new Error('Game file size exceeds the maximum allowed size (50MB).');
    }

    const fileId = uuidv4();
    const extension = originalName.split('.').pop() || '';
    const fileName = `games/${fileId}.${extension}`;
    
    // Add metadata for game files
    const metadata = {
      'original-name': originalName,
      'content-type': mimeType,
      'file-type': 'game',
    };

    // Upload the file to the storage service
    const url = await this.fileStorage.uploadFile(fileBuffer, fileName, mimeType, metadata);

    // Return the File entity
    return File.create({
      id: fileId,
      originalName,
      storagePath: fileName,
      mimeType,
      size,
      url,
      metadata,
    });
  }

  /**
   * Uploads a thumbnail image and returns the File entity
   * @param fileBuffer The file buffer
   * @param originalName The original file name
   * @param mimeType The MIME type
   * @param size The file size in bytes
   */
  async uploadThumbnail(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    size: number
  ): Promise<File> {
    // Validate the file is an image
    if (!mimeType.startsWith('image/')) {
      throw new Error('Invalid thumbnail type. Only image files are allowed.');
    }

    // Validate file size (5MB max)
    const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;
    if (size > MAX_THUMBNAIL_SIZE) {
      throw new Error('Thumbnail size exceeds the maximum allowed size (5MB).');
    }

    const fileId = uuidv4();
    const extension = originalName.split('.').pop() || '';
    const fileName = `thumbnails/${fileId}.${extension}`;
    
    // Add metadata for thumbnail images
    const metadata = {
      'original-name': originalName,
      'content-type': mimeType,
      'file-type': 'thumbnail',
    };

    // Upload the file to the storage service
    const url = await this.fileStorage.uploadFile(fileBuffer, fileName, mimeType, metadata);

    // Return the File entity
    return File.create({
      id: fileId,
      originalName,
      storagePath: fileName,
      mimeType,
      size,
      url,
      metadata,
    });
  }

  /**
   * Deletes a file
   * @param file The File entity to delete
   */
  async deleteFile(file: File): Promise<boolean> {
    return this.fileStorage.deleteFile(file.storagePath);
  }

  /**
   * Gets a pre-signed URL for a file
   * @param file The File entity
   * @param expiresInSeconds Time in seconds until URL expires
   */
  async getFileUrl(file: File, expiresInSeconds = 3600): Promise<string> {
    return this.fileStorage.getPresignedUrl(file.storagePath, expiresInSeconds);
  }
}