/**
 * VersionNumber is a value object that represents a semantic version number
 * Value objects in DDD are immutable and identified by their value, not by identity
 */
export class VersionNumber {
  private readonly _major: number;
  private readonly _minor: number;
  private readonly _patch: number;
  
  /**
   * Create a new VersionNumber
   * @param major Major version number (breaking changes)
   * @param minor Minor version number (non-breaking features)
   * @param patch Patch version number (bug fixes)
   */
  constructor(major: number, minor: number, patch: number) {
    if (major < 0 || minor < 0 || patch < 0) {
      throw new Error('Version numbers cannot be negative');
    }
    
    this._major = major;
    this._minor = minor;
    this._patch = patch;
  }
  
  /**
   * Parse a version string into a VersionNumber object
   * @param version Version string in the format "x.y.z"
   */
  static fromString(version: string): VersionNumber {
    if (!VersionNumber.isValid(version)) {
      throw new Error(`Invalid version format: ${version}. Expected format: x.y.z`);
    }
    
    const [major, minor, patch] = version.split('.').map(Number);
    return new VersionNumber(major, minor, patch);
  }
  
  /**
   * Check if a string is a valid version number
   */
  static isValid(version: string): boolean {
    return /^\d+\.\d+\.\d+$/.test(version);
  }
  
  /**
   * Create a version 1.0.0
   */
  static createInitial(): VersionNumber {
    return new VersionNumber(1, 0, 0);
  }
  
  /**
   * Major version number
   */
  get major(): number {
    return this._major;
  }
  
  /**
   * Minor version number
   */
  get minor(): number {
    return this._minor;
  }
  
  /**
   * Patch version number
   */
  get patch(): number {
    return this._patch;
  }
  
  /**
   * Increment the major version and reset minor and patch
   */
  incrementMajor(): VersionNumber {
    return new VersionNumber(this._major + 1, 0, 0);
  }
  
  /**
   * Increment the minor version and reset patch
   */
  incrementMinor(): VersionNumber {
    return new VersionNumber(this._major, this._minor + 1, 0);
  }
  
  /**
   * Increment the patch version
   */
  incrementPatch(): VersionNumber {
    return new VersionNumber(this._major, this._minor, this._patch + 1);
  }
  
  /**
   * Check if this version is greater than another version
   */
  isGreaterThan(other: VersionNumber): boolean {
    if (this._major > other._major) return true;
    if (this._major < other._major) return false;
    
    if (this._minor > other._minor) return true;
    if (this._minor < other._minor) return false;
    
    return this._patch > other._patch;
  }
  
  /**
   * Check if two versions are equal
   */
  equals(other: VersionNumber): boolean {
    return (
      this._major === other._major &&
      this._minor === other._minor &&
      this._patch === other._patch
    );
  }
  
  /**
   * Convert to string representation
   */
  toString(): string {
    return `${this._major}.${this._minor}.${this._patch}`;
  }
}