/**
 * SecurityLevel enum representing different levels of security for sandboxed games
 */
export enum SecurityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  MAXIMUM = 'maximum'
}

/**
 * SecurityLevelFactory for creating appropriate security levels
 * based on game metadata or content scan results
 */
export class SecurityLevelFactory {
  static fromGameMetadata(gameMetadata: any): SecurityLevel {
    // Simplified logic - in a real system, this would be more sophisticated
    // and would consider factors like game complexity, third-party libraries, etc.
    
    if (gameMetadata.hasExternalAPIs) {
      return SecurityLevel.HIGH;
    }
    
    if (gameMetadata.hasServerSideCode) {
      return SecurityLevel.MAXIMUM;
    }
    
    return SecurityLevel.MEDIUM; // Default security level
  }
  
  static fromScanResults(scanResults: any): SecurityLevel {
    // Determine security level based on scan results
    if (scanResults.suspiciousCodeFound) {
      return SecurityLevel.MAXIMUM;
    }
    
    if (scanResults.thirdPartyLibraries > 5) {
      return SecurityLevel.HIGH;
    }
    
    return SecurityLevel.MEDIUM;
  }
}