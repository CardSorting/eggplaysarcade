/**
 * File Domain Entity
 * Represents a file in the domain model
 */
export class File {
  constructor(
    public readonly id: string,
    public readonly originalName: string,
    public readonly storagePath: string,
    public readonly mimeType: string,
    public readonly size: number,
    public readonly url: string,
    public readonly metadata: Record<string, string> = {},
    public readonly createdAt: Date = new Date()
  ) {}

  /**
   * Creates a File entity from file data
   */
  static create(params: {
    id: string;
    originalName: string;
    storagePath: string;
    mimeType: string;
    size: number;
    url: string;
    metadata?: Record<string, string>;
  }): File {
    return new File(
      params.id,
      params.originalName,
      params.storagePath,
      params.mimeType,
      params.size,
      params.url,
      params.metadata || {},
      new Date()
    );
  }

  /**
   * Validates if the file is an image
   */
  isImage(): boolean {
    return this.mimeType.startsWith('image/');
  }

  /**
   * Validates if the file is an HTML file
   */
  isHtml(): boolean {
    return this.mimeType === 'text/html';
  }

  /**
   * Validates if the file is a zip archive
   */
  isZip(): boolean {
    return this.mimeType === 'application/zip';
  }

  /**
   * Checks if the file is a valid game file
   */
  isValidGameFile(): boolean {
    return this.isHtml() || this.isZip();
  }

  /**
   * Checks if file size is within specified limit
   */
  isSizeWithinLimit(limitInBytes: number): boolean {
    return this.size <= limitInBytes;
  }
}