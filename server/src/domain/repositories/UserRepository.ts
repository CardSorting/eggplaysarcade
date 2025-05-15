import { User } from '../entities/User';
import { EntityId } from '../value-objects/EntityId';

/**
 * Repository interface for User entities
 */
export interface UserRepository {
  findById(id: EntityId): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  save(user: User): Promise<User>;
}