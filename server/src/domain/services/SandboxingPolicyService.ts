import { SecurityLevel } from '../value-objects/SecurityLevel';
import { ResourceLimits } from '../value-objects/ResourceLimits';
import { NetworkPolicy } from '../entities/Sandbox';
import { GameBundle } from '../entities/GameBundle';

/**
 * SandboxingPolicyService provides methods to determine the appropriate
 * security policies for sandboxed games based on game metadata and scanning results.
 */
export class SandboxingPolicyService {
  /**
   * Determine the appropriate security level for a game bundle
   */
  determineSecurityLevel(gameBundle: GameBundle): SecurityLevel {
    // If the bundle has already been scanned, use the scan results to determine security level
    if (gameBundle.scanResults) {
      if (gameBundle.scanResults.suspiciousCodeFound) {
        return SecurityLevel.MAXIMUM;
      }
      
      if (gameBundle.scanResults.threatLevel === 'high' || 
          gameBundle.scanResults.threatLevel === 'critical') {
        return SecurityLevel.MAXIMUM;
      }
      
      if (gameBundle.scanResults.threatLevel === 'medium') {
        return SecurityLevel.HIGH;
      }
      
      return SecurityLevel.MEDIUM;
    }
    
    // Default security level if no scan results are available
    return SecurityLevel.HIGH;
  }
  
  /**
   * Determine resource limits based on security level
   */
  determineResourceLimits(securityLevel: SecurityLevel): ResourceLimits {
    return ResourceLimits.fromSecurityLevel(securityLevel);
  }
  
  /**
   * Determine network policy based on security level and game bundle
   */
  determineNetworkPolicy(securityLevel: SecurityLevel, gameBundle: GameBundle): NetworkPolicy {
    // Default policy - restrictive
    const policy: NetworkPolicy = {
      allowInbound: false,
      allowOutbound: false,
      allowedOutboundHosts: [],
      exposedPorts: [80]
    };
    
    // Adjust based on security level
    switch (securityLevel) {
      case SecurityLevel.LOW:
        policy.allowOutbound = true;
        // Still restrict to certain domains for CDNs, etc.
        policy.allowedOutboundHosts = [
          'cdn.jsdelivr.net',
          'fonts.googleapis.com',
          'ajax.googleapis.com',
          'cdnjs.cloudflare.com'
        ];
        break;
        
      case SecurityLevel.MEDIUM:
        policy.allowOutbound = true;
        // More restricted CDNs
        policy.allowedOutboundHosts = [
          'cdn.jsdelivr.net',
          'fonts.googleapis.com'
        ];
        break;
        
      case SecurityLevel.HIGH:
        // No outbound allowed except for essential services
        policy.allowedOutboundHosts = [
          'fonts.googleapis.com'
        ];
        break;
        
      case SecurityLevel.MAXIMUM:
        // No outbound connectivity at all
        break;
    }
    
    return policy;
  }
  
  /**
   * Determine container configuration based on security level
   */
  determineContainerConfig(securityLevel: SecurityLevel): ContainerConfig {
    // Base configuration - applied to all security levels
    const config: ContainerConfig = {
      readOnlyRootFilesystem: true,
      dropCapabilities: ['ALL'],
      allowPrivilegeEscalation: false,
      runAsNonRoot: true,
      seccompProfile: 'restricted',
      useHostNetwork: false
    };
    
    // Additional restrictions for higher security levels
    if (securityLevel === SecurityLevel.HIGH || securityLevel === SecurityLevel.MAXIMUM) {
      config.noNewPrivileges = true;
      config.restrictSyscalls = true;
    }
    
    return config;
  }
}

/**
 * Container security configuration
 */
interface ContainerConfig {
  readOnlyRootFilesystem: boolean;
  dropCapabilities: string[];
  allowPrivilegeEscalation: boolean;
  runAsNonRoot: boolean;
  seccompProfile: string;
  useHostNetwork: boolean;
  noNewPrivileges?: boolean;
  restrictSyscalls?: boolean;
}