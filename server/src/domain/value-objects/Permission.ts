/**
 * Permission value object
 * Following the Value Object pattern from Domain-Driven Design
 */
export class Permission {
  constructor(public readonly value: string) {
    if (!Permission.isValid(value)) {
      throw new Error(`Invalid permission: ${value}`);
    }
  }

  /**
   * List of all valid permissions in the system
   */
  public static readonly ALL_PERMISSIONS = [
    // Admin permissions
    'manage_users',
    'manage_games',
    'manage_categories',
    'moderate_content',
    'view_analytics',
    'configure_system',
    
    // Game Developer permissions
    'manage_own_games',
    'view_own_analytics',
    'edit_own_profile',
    'submit_games',
    
    // Player permissions
    'play_games',
    'rate_games',
    'manage_playlists'
  ] as const;
  
  /**
   * Type of all valid permissions
   */
  public static readonly PERMISSION_TYPE = Permission.ALL_PERMISSIONS[0];
  
  /**
   * Check if a permission value is valid
   */
  public static isValid(value: string): boolean {
    return (Permission.ALL_PERMISSIONS as readonly string[]).includes(value);
  }
  
  /**
   * Convert permission to string
   */
  public toString(): string {
    return this.value;
  }
  
  /**
   * Compare two permissions
   */
  public equals(other: Permission): boolean {
    if (!(other instanceof Permission)) {
      return false;
    }
    return this.value === other.value;
  }
}