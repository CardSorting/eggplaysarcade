import { DeploySandboxedGameCommand } from '../DeploySandboxedGameCommand';
import { SandboxRepository } from '../../../domain/repositories/SandboxRepository';
import { GameBundleRepository } from '../../../domain/repositories/GameBundleRepository';
import { SandboxStatus } from '../../../domain/entities/Sandbox';

/**
 * Handler for the DeploySandboxedGameCommand
 * Following the Command Handler pattern from CQRS
 */
export class DeploySandboxedGameCommandHandler {
  constructor(
    private readonly sandboxRepository: SandboxRepository,
    private readonly gameBundleRepository: GameBundleRepository,
    private readonly containerService: ContainerService
  ) {}

  /**
   * Execute the command to deploy a game to a sandbox
   */
  async execute(command: DeploySandboxedGameCommand): Promise<void> {
    // Retrieve the sandbox
    const sandbox = await this.sandboxRepository.findById(command.sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox not found with ID: ${command.sandboxId}`);
    }
    
    // Verify the sandbox status
    if (sandbox.status !== SandboxStatus.RUNNING) {
      throw new Error(`Sandbox is not in RUNNING state: ${command.sandboxId}`);
    }
    
    // Retrieve the game bundle
    const gameBundle = await this.gameBundleRepository.findById(command.gameBundleId);
    if (!gameBundle) {
      throw new Error(`Game bundle not found with ID: ${command.gameBundleId}`);
    }
    
    // Verify the game bundle has passed security scanning
    if (!gameBundle.isReadyForDeployment()) {
      throw new Error(`Game bundle is not ready for deployment: ${command.gameBundleId}`);
    }
    
    // Deploy the game to the sandbox
    await this.deployToSandbox(sandbox.id, gameBundle.getEntryPointPath());
    
    // Increment the active session count
    sandbox.incrementActiveSessionCount();
    await this.sandboxRepository.updateActiveSessionCount(
      sandbox.id, 
      sandbox.activeSessionCount
    );
  }
  
  /**
   * Deploy the game to the sandbox
   */
  private async deployToSandbox(sandboxId: string, entryPointPath: string): Promise<void> {
    try {
      // Deploy the game to the sandbox container
      await this.containerService.deployToContainer(sandboxId, entryPointPath);
    } catch (error) {
      console.error(`Error deploying game to sandbox ${sandboxId}:`, error);
      throw error;
    }
  }
}

/**
 * Interface for the container service
 * This would be implemented in the infrastructure layer
 */
interface ContainerService {
  deployToContainer(sandboxId: string, entryPointPath: string): Promise<void>;
}