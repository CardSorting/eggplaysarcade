import { v4 as uuidv4 } from 'uuid';
import { UploadGameCommand } from '../UploadGameCommand';
import { GameBundleRepository } from '../../../domain/repositories/GameBundleRepository';
import { SecurityLevel, SecurityLevelFactory } from '../../../domain/value-objects/SecurityLevel';
import { GameBundle, GameBundleFactory, ScanStatus } from '../../../domain/entities/GameBundle';

/**
 * Handler for the UploadGameCommand
 * Following the Command Handler pattern from CQRS
 */
export class UploadGameCommandHandler {
  constructor(
    private readonly gameBundleRepository: GameBundleRepository,
    private readonly contentScanningService: ContentScanningService
  ) {}

  /**
   * Execute the command to upload a game bundle
   */
  async execute(command: UploadGameCommand): Promise<string> {
    // Generate a unique ID for the game bundle
    const bundleId = uuidv4();
    
    // Determine the security level based on metadata
    const securityLevel = SecurityLevelFactory.fromGameMetadata(command.metadata);
    
    // Calculate total size
    const totalSize = command.files.reduce((total, file) => total + file.size, 0);
    
    // Create a new GameBundle entity
    const gameBundle = GameBundleFactory.create(
      bundleId,
      command.gameId,
      `/uploads/games/${command.gameId}/${bundleId}`,
      command.entryPoint,
      command.files.length,
      totalSize,
      securityLevel
    );
    
    // Save the game bundle
    await this.gameBundleRepository.save(gameBundle);
    
    // Trigger asynchronous scanning of the bundle
    this.triggerContentScanning(gameBundle.id, command.files.map(f => f.path));
    
    // Return the ID of the newly created game bundle
    return bundleId;
  }
  
  /**
   * Trigger asynchronous scanning of the game bundle
   * This is a fire-and-forget operation that updates the bundle status when complete
   */
  private async triggerContentScanning(bundleId: string, filePaths: string[]): Promise<void> {
    try {
      // Start the scan process
      const scanResults = await this.contentScanningService.scanFiles(filePaths);
      
      // Update the bundle with scan results
      await this.gameBundleRepository.updateScanResults(bundleId, {
        passed: scanResults.threatLevel !== 'critical',
        threatLevel: scanResults.threatLevel,
        findings: scanResults.findings,
        thirdPartyLibraries: scanResults.thirdPartyLibraries.length,
        suspiciousCodeFound: scanResults.suspiciousCodeFound,
        maliciousUrls: scanResults.maliciousUrls,
        scannedAt: new Date()
      });
    } catch (error) {
      console.error(`Error scanning game bundle ${bundleId}:`, error);
      // Mark the bundle as failed if scanning fails
      await this.gameBundleRepository.updateScanResults(bundleId, {
        passed: false,
        threatLevel: 'critical',
        findings: [{ 
          type: 'error', 
          severity: 'critical',
          description: 'Error scanning game bundle'
        }],
        thirdPartyLibraries: 0,
        suspiciousCodeFound: true,
        maliciousUrls: [],
        scannedAt: new Date()
      });
    }
  }
}

/**
 * Interface for the content scanning service
 * This would be implemented in the infrastructure layer
 */
interface ContentScanningService {
  scanFiles(filePaths: string[]): Promise<{
    threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    findings: Array<{
      type: string;
      severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
      description: string;
      location?: string;
    }>;
    thirdPartyLibraries: string[];
    suspiciousCodeFound: boolean;
    maliciousUrls: string[];
  }>;
}