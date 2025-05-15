import { User } from "../../../domain/entities/User";

/**
 * Data Transfer Object for User
 * Follows the DTO pattern to map domain entities to data structures suitable for client consumption
 */
export class UserDTO {
  id: number;
  username: string;
  createdAt: Date;

  private constructor(id: number, username: string, createdAt: Date) {
    this.id = id;
    this.username = username;
    this.createdAt = createdAt;
  }

  /**
   * Creates a DTO from a User entity
   */
  static fromEntity(user: User): UserDTO {
    return new UserDTO(
      user.id.value,
      user.username,
      user.createdAt
    );
  }

  /**
   * Creates DTOs from an array of User entities
   */
  static fromEntities(users: User[]): UserDTO[] {
    return users.map(user => UserDTO.fromEntity(user));
  }
}