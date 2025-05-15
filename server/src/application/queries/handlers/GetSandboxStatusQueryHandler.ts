import { GetSandboxStatusQuery } from '../GetSandboxStatusQuery';
import { SandboxRepository } from '../../../domain/repositories/SandboxRepository';

/**
 * Response data for GetSandboxStatusQuery
 */
export interface SandboxStatusDTO {
  id: string;
  gameId: string;
  gameBundleId: string;
  status: string;
  healthStatus: string;
  activeSessionCount: number;
  startedAt?: Date;
  metrics: {
    cpuUsagePercentage: number;
    memoryUsageMb: number;
    networkIngressBytes: number;
    networkEgressBytes: number;
    errorCount: number;
    averageResponseTimeMs: number;
  };
  publicUrl: string;
}

/**
 * Handler for the GetSandboxStatusQuery
 * Following the Query Handler pattern from CQRS
 */
export class GetSandboxStatusQueryHandler {
  constructor(
    private readonly sandboxRepository: SandboxRepository,
    private readonly containerService: ContainerService
  ) {}

  /**
   * Execute the query to get sandbox status
   */
  async execute(query: GetSandboxStatusQuery): Promise<SandboxStatusDTO | null> {
    // Retrieve the sandbox from the repository
    const sandbox = await this.sandboxRepository.findById(query.sandboxId);
    if (!sandbox) {
      return null;
    }
    
    // Get real-time metrics from container service
    const liveMetrics = await this.containerService.getContainerMetrics(query.sandboxId);
    
    // Update sandbox with latest metrics
    if (liveMetrics) {
      sandbox.updateMetrics(liveMetrics);
      await this.sandboxRepository.updateMetrics(query.sandboxId, liveMetrics);
    }
    
    // Map the domain entity to the DTO
    return {
      id: sandbox.id,
      gameId: sandbox.gameId,
      gameBundleId: sandbox.gameBundleId,
      status: sandbox.status,
      healthStatus: sandbox.healthStatus,
      activeSessionCount: sandbox.activeSessionCount,
      startedAt: sandbox.startedAt,
      metrics: sandbox.metrics,
      publicUrl: sandbox.publicUrl
    };
  }
}

/**
 * Interface for the container service
 * This would be implemented in the infrastructure layer
 */
interface ContainerService {
  getContainerMetrics(sandboxId: string): Promise<{
    cpuUsagePercentage: number;
    memoryUsageMb: number;
    networkIngressBytes: number;
    networkEgressBytes: number;
    errorCount: number;
    averageResponseTimeMs: number;
  } | null>;
}