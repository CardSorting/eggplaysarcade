import { v4 as uuidv4 } from 'uuid';
import { CreateSandboxCommand } from '../CreateSandboxCommand';
import { SandboxRepository } from '../../../domain/repositories/SandboxRepository';
import { GameBundleRepository } from '../../../domain/repositories/GameBundleRepository';
import { ResourceLimits } from '../../../domain/value-objects/ResourceLimits';
import { Sandbox, SandboxFactory, NetworkPolicy } from '../../../domain/entities/Sandbox';
import { SandboxingPolicyService } from '../../../domain/services/SandboxingPolicyService';

/**
 * Handler for the CreateSandboxCommand
 * Following the Command Handler pattern from CQRS
 */
export class CreateSandboxCommandHandler {
  constructor(
    private readonly sandboxRepository: SandboxRepository,
    private readonly gameBundleRepository: GameBundleRepository,
    private readonly sandboxingPolicyService: SandboxingPolicyService,
    private readonly containerService: ContainerService
  ) {}

  /**
   * Execute the command to create a sandbox for a game
   */
  async execute(command: CreateSandboxCommand): Promise<string> {
    // Generate a unique ID for the sandbox
    const sandboxId = uuidv4();
    
    // Retrieve the game bundle
    const gameBundle = await this.gameBundleRepository.findById(command.gameBundleId);
    if (!gameBundle) {
      throw new Error(`Game bundle not found with ID: ${command.gameBundleId}`);
    }
    
    // Verify the game bundle has passed security scanning
    if (!gameBundle.isReadyForDeployment()) {
      throw new Error(`Game bundle is not ready for deployment: ${command.gameBundleId}`);
    }
    
    // Determine resource limits based on security level
    const resourceLimits = this.sandboxingPolicyService.determineResourceLimits(command.securityLevel);
    
    // Determine network policy based on security level and game bundle
    const networkPolicy = this.sandboxingPolicyService.determineNetworkPolicy(
      command.securityLevel, 
      gameBundle
    );
    
    // Create a new Sandbox entity
    const sandbox = SandboxFactory.create(
      sandboxId,
      command.gameId,
      command.gameBundleId,
      command.securityLevel,
      resourceLimits,
      networkPolicy,
      command.containerImage,
      command.expiresInHours
    );
    
    // Save the sandbox
    await this.sandboxRepository.save(sandbox);
    
    // Provision the actual container in the infrastructure
    await this.provisionContainer(sandbox);
    
    // Return the ID of the newly created sandbox
    return sandboxId;
  }
  
  /**
   * Provision the actual container in the infrastructure
   */
  private async provisionContainer(sandbox: Sandbox): Promise<void> {
    try {
      // Get container configuration
      const containerConfig = this.sandboxingPolicyService.determineContainerConfig(
        sandbox.securityLevel
      );
      
      // Provision the container
      await this.containerService.createContainer({
        id: sandbox.id,
        image: sandbox.containerImage,
        resourceLimits: sandbox.resourceLimits.toContainerConfig(),
        networkPolicy: sandbox.networkPolicy,
        securityConfig: containerConfig,
        volumes: [
          {
            source: `/uploads/games/${sandbox.gameId}/${sandbox.gameBundleId}`,
            target: '/app/game',
            readOnly: true
          }
        ],
        environment: {
          SANDBOX_ID: sandbox.id,
          GAME_ID: sandbox.gameId,
          BUNDLE_ID: sandbox.gameBundleId,
          SECURITY_LEVEL: sandbox.securityLevel
        }
      });
      
      // Mark the sandbox as started
      sandbox.start();
      await this.sandboxRepository.updateStatus(sandbox.id, sandbox.status);
      
    } catch (error) {
      console.error(`Error provisioning container for sandbox ${sandbox.id}:`, error);
      // Mark the sandbox as terminated with an error
      sandbox.terminate(`Failed to provision container: ${error.message}`);
      await this.sandboxRepository.markAsTerminated(
        sandbox.id, 
        sandbox.terminationReason!
      );
      
      // Re-throw the error
      throw error;
    }
  }
}

/**
 * Interface for the container service
 * This would be implemented in the infrastructure layer
 */
interface ContainerService {
  createContainer(config: {
    id: string;
    image: string;
    resourceLimits: { cpu: string; memory: string; storage: string };
    networkPolicy: NetworkPolicy;
    securityConfig: any;
    volumes: Array<{
      source: string;
      target: string;
      readOnly: boolean;
    }>;
    environment: Record<string, string>;
  }): Promise<void>;
}