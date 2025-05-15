import { UserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';

export interface CreateUserCommandParams {
  username: string;
  password: string;
}

/**
 * Command for creating a new user
 */
export class CreateUserCommand {
  constructor(
    private readonly userRepository: UserRepository
  ) {}

  async execute(params: CreateUserCommandParams): Promise<User> {
    // Check if username already exists
    const existingUser = await this.userRepository.findByUsername(params.username);
    
    if (existingUser) {
      throw new Error(`Username '${params.username}' is already taken`);
    }
    
    // In a real app, we would hash the password here
    const user = User.create(params.username, params.password);
    
    // Save to repository
    return await this.userRepository.save(user);
  }
}