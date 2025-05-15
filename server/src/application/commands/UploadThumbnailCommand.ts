/**
 * Upload Thumbnail Command
 * Represents the intent to upload a thumbnail image
 * Part of the CQRS pattern
 */
export class UploadThumbnailCommand {
  constructor(
    public readonly fileBuffer: Buffer,
    public readonly originalName: string,
    public readonly mimeType: string,
    public readonly size: number,
    public readonly userId: number
  ) {}
}