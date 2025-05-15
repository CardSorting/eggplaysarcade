import { v4 as uuidv4 } from 'uuid';
import { SubmitGameCommand } from '../SubmitGameCommand';
import { GameRepository } from '../../../domain/repositories/GameRepository';
import { GameSubmissionRepository } from '../../../domain/repositories/GameSubmissionRepository';
import { GameBundleRepository } from '../../../domain/repositories/GameBundleRepository';
import { GameSubmission, SubmissionStatus, GameSubmissionMetadata } from '../../../domain/entities/GameSubmission';
import { GameBundle } from '../../../domain/entities/GameBundle';
import { AssetManager } from '../../../infrastructure/services/AssetManager';
import { ContentScanningService } from '../../../infrastructure/services/ContentScanningService';

/**
 * Handler for the SubmitGameCommand
 * Part of the application layer in Clean Architecture (CQRS pattern)
 */
export class SubmitGameCommandHandler {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly gameSubmissionRepository: GameSubmissionRepository,
    private readonly gameBundleRepository: GameBundleRepository,
    private readonly assetManager: AssetManager,
    private readonly contentScanningService: ContentScanningService
  ) {}

  /**
   * Execute the command to submit a game
   */
  async execute(command: SubmitGameCommand): Promise<{ gameId: string, submissionId: string }> {
    try {
      // If gameId is not provided, create a new game
      let gameId = command.gameId;
      if (!gameId) {
        // Create new game entity
        gameId = uuidv4();
        // TODO: Initialize the game with basic metadata
        // This would be implemented using the game repository
      } else {
        // Verify that the game exists and belongs to the developer
        const game = await this.gameRepository.findById(gameId);
        if (!game) {
          throw new Error(`Game with ID ${gameId} not found`);
        }
        
        if (game.developerId !== command.developerId) {
          throw new Error('You do not have permission to update this game');
        }
      }

      // Process and store game assets
      const iconImageUrl = await this.assetManager.uploadImage(
        command.assets.iconImage,
        'icon',
        gameId
      );
      
      const headerImageUrl = await this.assetManager.uploadImage(
        command.assets.headerImage,
        'header',
        gameId
      );
      
      const screenshotUrls = await Promise.all(
        command.assets.screenshots.map(screenshot => 
          this.assetManager.uploadImage(screenshot, 'screenshot', gameId)
        )
      );
      
      const videoTrailerUrls = command.assets.videoTrailers
        ? await Promise.all(
            command.assets.videoTrailers.map(trailer =>
              this.assetManager.uploadVideo(trailer, gameId)
            )
          )
        : [];

      // Extract and store the game bundle
      const extractedFiles = await this.assetManager.extractGameBundle(
        command.assets.gameBundle,
        gameId
      );

      // Scan extracted files for security issues
      const scanResults = await this.contentScanningService.scanFiles(extractedFiles);
      
      // If critical security issues are found, reject the submission
      if (scanResults.threatLevel === 'critical') {
        throw new Error(`Security scan failed: ${scanResults.findings.map(f => f.description).join(', ')}`);
      }

      // Create a new game bundle entry
      const bundleId = uuidv4();
      const gameBundle = new GameBundle({
        id: bundleId,
        gameId,
        versionNumber: this.generateVersionNumber(),
        entryPoint: extractedFiles.find(file => file.endsWith('index.html')) || '',
        uploadedAt: new Date(),
        fileCount: extractedFiles.length,
        totalSizeBytes: command.assets.gameBundle.size,
        securityScanResults: scanResults,
        extractedFilePaths: extractedFiles
      });
      
      await this.gameBundleRepository.save(gameBundle);

      // Prepare submission metadata
      const metadata: GameSubmissionMetadata = {
        title: command.title,
        description: command.description,
        shortDescription: command.shortDescription,
        features: command.features,
        categories: command.categories,
        tags: command.tags,
        minimumSystemRequirements: command.minimumSystemRequirements,
        recommendedSystemRequirements: command.recommendedSystemRequirements,
        pricingTier: command.pricingTier,
        monetizationSettings: command.monetizationSettings,
        legalInfo: command.legalInfo,
        technicalDetails: command.technicalDetails,
        assets: {
          iconImageUrl,
          headerImageUrl,
          screenshotUrls,
          videoTrailerUrls
        },
        releaseNotes: command.releaseNotes || ''
      };

      // Create a new game submission
      const submissionId = uuidv4();
      const gameSubmission = new GameSubmission({
        id: submissionId,
        gameId,
        developerId: command.developerId,
        versionNumber: gameBundle.versionNumber,
        status: command.asDraft ? SubmissionStatus.DRAFT : SubmissionStatus.SUBMITTED,
        reviewNotes: [],
        bundleId,
        rejectionReason: null,
        submittedAt: new Date(),
        reviewedAt: null,
        publishedAt: null,
        reviewerId: null,
        metadata
      });
      
      await this.gameSubmissionRepository.save(gameSubmission);

      return {
        gameId,
        submissionId
      };
    } catch (error) {
      console.error('Error in SubmitGameCommandHandler:', error);
      throw error;
    }
  }

  /**
   * Generate a version number for the game
   * Format: 1.0.0, 1.0.1, etc.
   */
  private generateVersionNumber(): string {
    // In a real implementation, this would get the latest version number
    // and increment it appropriately
    return '1.0.0';
  }
}