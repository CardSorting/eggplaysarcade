/**
 * Enum for user roles in the application
 */
export enum UserRole {
  ADMIN = 'admin',
  GAME_DEVELOPER = 'game_developer',
  PLAYER = 'player'
}

/**
 * User interface matching the backend User entity
 */
export interface User {
  id: number;
  username: string;
  role: UserRole;
  email?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

/**
 * Permissions available in the system
 */
export type Permission = 
  'manage_users' | 
  'manage_games' | 
  'manage_categories' | 
  'moderate_content' | 
  'view_analytics' | 
  'configure_system' | 
  'manage_own_games' | 
  'view_own_analytics' | 
  'edit_own_profile' | 
  'submit_games' | 
  'play_games' | 
  'rate_games' | 
  'manage_playlists';

/**
 * Mapping of permissions to roles
 */
export const RolePermissions: Record<UserRole, Permission[]> = {
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