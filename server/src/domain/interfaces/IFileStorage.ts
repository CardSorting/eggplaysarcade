/**
 * File Storage Interface 
 * Following the Interface Segregation Principle (SOLID)
 */
export interface IFileStorage {
  /**
   * Upload a file to the storage service
   * @param fileBuffer The file buffer to upload
   * @param fileName The name of the file
   * @param contentType The MIME type of the file
   * @param metadata Optional metadata for the file
   * @returns Promise with the URL of the uploaded file
   */
  uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<string>;

  /**
   * Delete a file from the storage service
   * @param fileUrl The URL of the file to delete
   * @returns Promise indicating success or failure
   */
  deleteFile(fileUrl: string): Promise<boolean>;
  
  /**
   * Generate a pre-signed URL for a file
   * @param fileUrl The URL of the file
   * @param expiresInSeconds Time in seconds until URL expires
   * @returns Promise with the pre-signed URL
   */
  getPresignedUrl(fileUrl: string, expiresInSeconds: number): Promise<string>;
}