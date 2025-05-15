import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { IFileStorage } from '../../domain/interfaces/IFileStorage';

/**
 * BackblazeB2Storage
 * Concrete implementation of IFileStorage for Backblaze B2
 * Following the Dependency Inversion Principle (SOLID)
 */
export class BackblazeB2Storage implements IFileStorage {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly endpoint: string;
  private readonly region: string;

  constructor() {
    // Get configuration from environment variables
    const keyId = process.env.B2_APPLICATION_KEY_ID;
    const applicationKey = process.env.B2_APPLICATION_KEY;
    this.bucketName = 'egggamesbucket';
    this.endpoint = 'https://s3.us-east-005.backblazeb2.com';
    this.region = 'us-east-005';

    // Validate required environment variables
    if (!keyId || !applicationKey) {
      throw new Error('Missing required Backblaze B2 credentials. Please set B2_APPLICATION_KEY_ID and B2_APPLICATION_KEY environment variables.');
    }

    // Initialize S3 client for Backblaze B2
    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region: this.region,
      credentials: {
        accessKeyId: keyId,
        secretAccessKey: applicationKey
      }
    });
  }

  /**
   * Upload a file to Backblaze B2
   * @param fileBuffer The file buffer to upload
   * @param fileName The object key (path) in the bucket
   * @param contentType The MIME type of the file
   * @param metadata Optional metadata for the file
   * @returns Promise with the URL of the uploaded file
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string,
    metadata: Record<string, string> = {}
  ): Promise<string> {
    try {
      // Use multipart upload for larger files
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: fileName,
          Body: fileBuffer,
          ContentType: contentType,
          Metadata: metadata,
          // Make the file publicly accessible (important for game files)
          ACL: 'public-read'
        }
      });

      // Start the upload
      await upload.done();

      // Return the public URL of the uploaded file
      return `${this.endpoint}/${this.bucketName}/${fileName}`;
    } catch (error) {
      console.error('Error uploading file to Backblaze B2:', error);
      throw new Error(`Failed to upload file to Backblaze B2: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a file from Backblaze B2
   * @param fileUrl The URL or path of the file to delete
   * @returns Promise indicating success or failure
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // Extract the object key from the URL or path
      const objectKey = this.getObjectKeyFromUrl(fileUrl);
      
      // Delete the object
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: objectKey
        })
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting file from Backblaze B2:', error);
      return false;
    }
  }

  /**
   * Generate a pre-signed URL for a file
   * @param fileUrl The URL or path of the file
   * @param expiresInSeconds Time in seconds until URL expires
   * @returns Promise with the pre-signed URL
   */
  async getPresignedUrl(fileUrl: string, expiresInSeconds: number): Promise<string> {
    try {
      // Extract the object key from the URL or path
      const objectKey = this.getObjectKeyFromUrl(fileUrl);
      
      // Create a command to get the object
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey
      });
      
      // Generate a pre-signed URL
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: expiresInSeconds
      });
      
      return presignedUrl;
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      throw new Error(`Failed to generate pre-signed URL: ${(error as Error).message}`);
    }
  }

  /**
   * Extract the object key from a file URL or path
   * @param fileUrl The URL or path
   * @returns The object key
   */
  private getObjectKeyFromUrl(fileUrl: string): string {
    // If it's already just a path/key, return it
    if (!fileUrl.includes('http') && !fileUrl.includes(this.bucketName)) {
      return fileUrl;
    }
    
    try {
      // Otherwise, attempt to extract the key from a URL
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      
      // Remove empty parts and the bucket name if present
      const filteredParts = pathParts.filter(part => 
        part && part !== this.bucketName
      );
      
      return filteredParts.join('/');
    } catch (error) {
      // If not a valid URL, assume it's a path with bucket name
      // e.g. "egggamesbucket/games/file.html" -> "games/file.html"
      const parts = fileUrl.split('/');
      const bucketIndex = parts.findIndex(part => part === this.bucketName);
      
      if (bucketIndex >= 0) {
        return parts.slice(bucketIndex + 1).join('/');
      }
      
      // If can't parse, return the original
      return fileUrl;
    }
  }
}