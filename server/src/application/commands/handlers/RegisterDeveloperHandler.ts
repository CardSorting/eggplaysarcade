import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { RegisterDeveloperCommand } from '../RegisterDeveloperCommand';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { DeveloperEntity } from '../../../domain/entities/DeveloperEntity';

const scryptAsync = promisify(scrypt);

/**
 * Command Handler for game developer registration
 * Following CQRS pattern - This handler processes the intent to register a developer
 */
export class RegisterDeveloperHandler {
  constructor(private readonly userRepository: IUserRepository) {}
  
  async execute(command: RegisterDeveloperCommand): Promise<DeveloperEntity> {
    // Check if username already exists
    const existingUser = await this.userRepository.findByUsername(command.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    // Hash password
    const passwordHash = await this.hashPassword(command.password);
    
    // Create developer entity
    const developer = DeveloperEntity.create(
      command.username,
      passwordHash,
      command.email,
      command.companyName,
      command.portfolio,
      command.displayName
    );
    
    // Save developer to database
    return await this.userRepository.createDeveloper(developer);
  }
  
  /**
   * Hash password using scrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString('hex')}.${salt}`;
  }
}