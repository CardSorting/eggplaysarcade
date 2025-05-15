import { EntityId } from "../value-objects/EntityId";

/**
 * User entity following the Domain-Driven Design (DDD) approach
 * This is a core domain entity representing a user in the system
 */
export class User {
  id: EntityId;
  username: string;
  password: string;
  createdAt: Date;

  /**
   * Create a new User entity
   */
  constructor(id: EntityId, username: string, password: string, createdAt: Date = new Date()) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.createdAt = createdAt;
  }
}