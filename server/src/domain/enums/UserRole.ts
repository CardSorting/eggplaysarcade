/**
 * Enum representing the different roles a user can have in the system
 * Following Domain-Driven Design principles by placing this in the domain layer
 */
export enum UserRole {
  ADMIN = 'admin',
  GAME_DEVELOPER = 'game_developer',
  PLAYER = 'player'
}