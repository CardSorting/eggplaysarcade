import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { RegisterPlayerCommand } from '../RegisterPlayerCommand';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { PlayerEntity } from '../../../domain/entities/PlayerEntity';

const scryptAsync = promisify(scrypt);

/**
 * Command Handler for player registration
 * Following CQRS pattern - This handler processes the intent to register a player
 */
export class RegisterPlayerHandler {
  constructor(private readonly userRepository: IUserRepository) {}
  
  async execute(command: RegisterPlayerCommand): Promise<PlayerEntity> {
    // Check if username already exists
    const existingUser = await this.userRepository.findByUsername(command.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    // Hash password
    const passwordHash = await this.hashPassword(command.password);
    
    // Create player entity
    const player = PlayerEntity.create(
      command.username,
      passwordHash,
      command.email,
      command.displayName
    );
    
    // Save player to database
    return await this.userRepository.createPlayer(player);
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