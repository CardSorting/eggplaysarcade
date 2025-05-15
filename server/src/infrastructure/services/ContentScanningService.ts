import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * ContentScanningService is responsible for scanning uploaded game bundles
 * for potential security threats
 */
export class ContentScanningService {
  private readonly rulesets: SecurityRuleset[];
  private readonly thirdPartyLibraryPatterns: string[];
  private readonly maliciousUrlPatterns: RegExp[];

  constructor() {
    // Initialize with security rulesets
    this.rulesets = [
      {
        name: 'JavaScript Injection',
        patterns: [
          /eval\s*\(/g,
          /Function\s*\(/g,
          /setTimeout\s*\(\s*['"`]/g,
          /setInterval\s*\(\s*['"`]/g,
          /document\.write\s*\(/g,
          /\.innerHTML\s*[=+]/g
        ],
        severity: 'high'
      },
      {
        name: 'Cross-Site Scripting (XSS)',
        patterns: [
          /document\.cookie/g,
          /localStorage\./g,
          /sessionStorage\./g,
          /\.innerText\s*=[^=]/g,
          /\.createTextNode\s*\(/g
        ],
        severity: 'medium'
      },
      {
        name: 'Potentially Dangerous APIs',
        patterns: [
          /\.ajax\s*\(/g,
          /fetch\s*\(/g,
          /XMLHttpRequest/g,
          /navigator\.sendBeacon/g,
          /WebSocket\s*\(/g
        ],
        severity: 'medium'
      },
      {
        name: 'JavaScript Obfuscation',
        patterns: [
          /atob\s*\(/g,
          /btoa\s*\(/g,
          /String\.fromCharCode/g,
          /unescape\s*\(/g,
          /decodeURIComponent\s*\(/g,
          /\[\s*['"`]\\x/g
        ],
        severity: 'medium'
      },
      {
        name: 'Privilege Escalation',
        patterns: [
          /window\.opener/g,
          /window\.parent/g,
          /top\./g,
          /parent\./g,
          /frameElement/g
        ],
        severity: 'high'
      },
      {
        name: 'Access to External Resources',
        patterns: [
          /<\s*script[^>]+src\s*=\s*['"][^'"]+['"]/g,
          /<\s*link[^>]+href\s*=\s*['"][^'"]+['"]/g,
          /<\s*img[^>]+src\s*=\s*['"][^'"]+['"]/g,
          /import\s+.*\s+from\s+['"][^'"]+['"]/g,
          /require\s*\(\s*['"][^'"]+['"]\s*\)/g
        ],
        severity: 'low'
      }
    ];

    // Patterns to identify common third-party libraries
    this.thirdPartyLibraryPatterns = [
      'jquery',
      'react',
      'angular',
      'vue',
      'bootstrap',
      'three.js',
      'pixi.js',
      'phaser',
      'babylon.js',
      'lodash',
      'firebase',
      'socket.io',
      'crypto-js',
      'gsap',
      'moment',
      'axios'
    ];

    // Patterns for potentially malicious URLs
    this.maliciousUrlPatterns = [
      /https?:\/\/([^\s"']+)\.ru/g,
      /https?:\/\/([^\s"']+)\.cn/g,
      /https?:\/\/([^\s"']+)\.tk/g,
      /https?:\/\/([^\s"']+)\.xyz/g,
      /https?:\/\/([^\s"']+)\.top/g,
      /https?:\/\/([^\s"']+)\.pw/g,
      /https?:\/\/([^\s"']+)\.cc/g,
      /https?:\/\/([^\s"']+)\.su/g,
      /https?:\/\/([^\s"']+)\.ga/g,
      /https?:\/\/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/g // IP addresses
    ];
  }

  /**
   * Scan files for potential security issues
   */
  async scanFiles(filePaths: string[]): Promise<ScanResults> {
    console.log(`Scanning ${filePaths.length} files`);
    
    const findings: ScanFinding[] = [];
    const detectedLibraries: Set<string> = new Set();
    const maliciousUrls: string[] = [];
    let suspiciousCodeFound = false;
    
    // Process each file
    for (const filePath of filePaths) {
      try {
        // Skip non-text files
        if (!this.isTextFile(filePath)) {
          continue;
        }
        
        const content = await fs.readFile(filePath, 'utf-8');
        const fileName = path.basename(filePath);
        
        // Check for security issues
        for (const ruleset of this.rulesets) {
          for (const pattern of ruleset.patterns) {
            const matches = content.match(pattern);
            if (matches && matches.length > 0) {
              findings.push({
                type: ruleset.name,
                severity: ruleset.severity as any,
                description: `Found potentially unsafe pattern: ${pattern}`,
                location: fileName
              });
              
              // Mark as suspicious if high severity
              if (ruleset.severity === 'high' || ruleset.severity === 'critical') {
                suspiciousCodeFound = true;
              }
            }
          }
        }
        
        // Check for third-party libraries
        for (const lib of this.thirdPartyLibraryPatterns) {
          if (content.toLowerCase().includes(lib.toLowerCase())) {
            detectedLibraries.add(lib);
          }
        }
        
        // Check for malicious URLs
        for (const pattern of this.maliciousUrlPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            maliciousUrls.push(...matches);
            suspiciousCodeFound = true;
          }
        }
      } catch (error) {
        console.error(`Error scanning file ${filePath}:`, error);
        findings.push({
          type: 'Scan Error',
          severity: 'info',
          description: `Unable to scan file: ${error.message}`,
          location: filePath
        });
      }
    }
    
    // Determine overall threat level
    let threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none';
    
    const criticalFindings = findings.filter(f => f.severity === 'critical').length;
    const highFindings = findings.filter(f => f.severity === 'high').length;
    const mediumFindings = findings.filter(f => f.severity === 'medium').length;
    
    if (criticalFindings > 0 || maliciousUrls.length > 3) {
      threatLevel = 'critical';
    } else if (highFindings > 3 || maliciousUrls.length > 0) {
      threatLevel = 'high';
    } else if (highFindings > 0 || mediumFindings > 5) {
      threatLevel = 'medium';
    } else if (mediumFindings > 0 || findings.length > 0) {
      threatLevel = 'low';
    }
    
    return {
      passed: threatLevel !== 'critical',
      threatLevel,
      findings,
      thirdPartyLibraries: Array.from(detectedLibraries),
      suspiciousCodeFound,
      maliciousUrls,
      scannedAt: new Date()
    };
  }
  
  /**
   * Check if a file is likely to be a text file that we can scan
   */
  private isTextFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    const textExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.html', '.htm', '.css', 
      '.svg', '.json', '.xml', '.txt', '.md'
    ];
    
    return textExtensions.includes(ext);
  }
}

/**
 * Security ruleset for content scanning
 */
interface SecurityRuleset {
  name: string;
  patterns: RegExp[];
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Results from scanning game files
 */
export interface ScanResults {
  passed: boolean;
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  findings: ScanFinding[];
  thirdPartyLibraries: string[];
  suspiciousCodeFound: boolean;
  maliciousUrls: string[];
  scannedAt: Date;
}

/**
 * Individual finding from the security scan
 */
export interface ScanFinding {
  type: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string;
  details?: string;
}