/**
 * Upload Game Command
 * Represents the intent to upload a game file
 * Part of the CQRS pattern
 */
export class UploadGameCommand {
  constructor(
    public readonly fileBuffer: Buffer,
    public readonly originalName: string,
    public readonly mimeType: string,
    public readonly size: number,
    public readonly userId: number
  ) {}
}