import { UserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';
import { EntityId } from '../../domain/value-objects/EntityId';

/**
 * In-memory implementation of the UserRepository
 */
export class MemUserRepository implements UserRepository {
  private users: Map<number, User>;
  
  constructor() {
    this.users = new Map<number, User>();
    
    // Initialize with a demo user
    this.initializeDemoUser();
  }

  private async initializeDemoUser(): Promise<void> {
    const demoUser = User.create('demo_user', 'password');
    await this.save(demoUser);
  }

  async findById(id: EntityId): Promise<User | null> {
    const user = this.users.get(id.value);
    return user || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const users = Array.from(this.users.values());
    const user = users.find(u => u.username === username);
    return user || null;
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id.value, user);
    return user;
  }
}