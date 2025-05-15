/**
 * Enumeration of possible user roles in the system
 * This implements the Role-Based Access Control (RBAC) pattern
 */
export enum UserRole {
  ADMIN = 'admin',
  GAME_DEVELOPER = 'game_developer',
  PLAYER = 'player'
}

/**
 * Default role for new users
 */
export const DEFAULT_ROLE = UserRole.PLAYER;

/**
 * Helper function to check if a role is valid
 */
export function isValidRole(role: string): boolean {
  return Object.values(UserRole).includes(role as UserRole);
}

/**
 * Mapping of permissions by role
 */
export const RolePermissions = {
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
 * Check if a given role has a specific permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  return RolePermissions[role]?.includes(permission) || false;
}