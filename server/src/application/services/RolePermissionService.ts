import { UserRole } from "../../domain/enums/UserRole";
import { Permission } from "../../domain/valueObjects/Permission";

/**
 * Service for managing role-based permissions
 * This follows the Domain Service pattern from Domain-Driven Design
 */
export class RolePermissionService {
  // Map of role to permissions
  private readonly rolePermissionsMap: Record<UserRole, Permission[]> = {
    [UserRole.ADMIN]: [
      'manage_users',
      'manage_games',
      'manage_categories',
      'moderate_content',
      'view_analytics',
      'configure_system',
      'play_games',
      'rate_games',
    ],
    [UserRole.GAME_DEVELOPER]: [
      'manage_own_games',
      'view_own_analytics',
      'edit_own_profile',
      'submit_games',
      'play_games',
      'rate_games',
    ],
    [UserRole.PLAYER]: [
      'play_games',
      'rate_games',
      'edit_own_profile',
      'manage_playlists',
    ],
  };

  /**
   * Check if a role has a specific permission
   * @param role The user role
   * @param permission The permission to check
   * @returns true if the role has the permission, false otherwise
   */
  public hasPermission(role: UserRole, permission: Permission): boolean {
    if (!role || !permission) return false;
    
    const permissions = this.rolePermissionsMap[role];
    if (!permissions) return false;
    
    return permissions.includes(permission);
  }

  /**
   * Get all permissions for a role
   * @param role The user role
   * @returns Array of permissions for the role
   */
  public getPermissionsForRole(role: UserRole): Permission[] {
    return this.rolePermissionsMap[role] || [];
  }
}