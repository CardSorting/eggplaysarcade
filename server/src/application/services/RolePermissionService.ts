import { UserRole } from "../../domain/enums/UserRole";
import { Permission } from "../../domain/value-objects/Permission";

/**
 * Service for managing role-based permissions
 * Following the Service pattern from Domain-Driven Design
 */
export class RolePermissionService {
  /**
   * Mapping of permissions to roles
   * This defines which permissions are granted to each role
   */
  private static readonly rolePermissionsMap: Record<UserRole, string[]> = {
    [UserRole.ADMIN]: [
      'manage_users',
      'manage_games',
      'manage_categories',
      'moderate_content',
      'view_analytics',
      'configure_system',
      'play_games',
      'rate_games',
      'manage_playlists',
      'submit_games',
      'manage_own_games',
      'view_own_analytics',
      'edit_own_profile'
    ],
    
    [UserRole.GAME_DEVELOPER]: [
      'manage_own_games',
      'view_own_analytics',
      'edit_own_profile',
      'submit_games',
      'play_games',
      'rate_games',
      'manage_playlists'
    ],
    
    [UserRole.PLAYER]: [
      'play_games',
      'rate_games',
      'manage_playlists',
      'edit_own_profile'
    ]
  };
  
  /**
   * Get all permissions for a given role
   */
  public getPermissionsForRole(role: UserRole): Permission[] {
    const permissionStrings = RolePermissionService.rolePermissionsMap[role] || [];
    return permissionStrings.map(p => new Permission(p));
  }
  
  /**
   * Check if a role has a specific permission
   */
  public roleHasPermission(role: UserRole, permission: string): boolean {
    const permissionStrings = RolePermissionService.rolePermissionsMap[role] || [];
    return permissionStrings.includes(permission);
  }
  
  /**
   * Get all the permissions that exist in the system
   */
  public getAllPermissions(): Permission[] {
    return Permission.ALL_PERMISSIONS.map(p => new Permission(p));
  }
  
  /**
   * Get all available roles in the system
   */
  public getAllRoles(): UserRole[] {
    return Object.values(UserRole);
  }
  
  /**
   * Check if a permission is valid
   */
  public isValidPermission(permission: string): boolean {
    return Permission.isValid(permission);
  }
}