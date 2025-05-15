/**
 * Strong typed permissions in the system
 * Following the Value Object pattern from Domain-Driven Design
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