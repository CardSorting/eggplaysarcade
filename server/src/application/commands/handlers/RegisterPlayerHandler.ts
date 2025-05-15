import { RegisterPlayerCommand } from "../RegisterPlayerCommand";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { PlayerEntity } from "../../../domain/entities/PlayerEntity";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

// Password hashing utility (same as in auth.ts)
const scryptAsync = promisify(scrypt);

/**
 * Handler for RegisterPlayerCommand
 * Following CQRS pattern, this handler is responsible for registering a player
 */
export class RegisterPlayerHandler {
  constructor(private readonly userRepository: IUserRepository) {}

  async handle(command: RegisterPlayerCommand): Promise<PlayerEntity> {
    // Check if username already exists
    const usernameExists = await this.userRepository.usernameExists(command.username);
    if (usernameExists) {
      throw new Error("Username already exists");
    }

    // Hash password
    const hashedPassword = await this.hashPassword(command.password);

    // Create player entity
    const playerEntity = new PlayerEntity(
      command.username,
      hashedPassword,
      {
        email: command.email,
        displayName: command.displayName,
        avatarUrl: command.avatarUrl,
        bio: command.bio
      }
    );

    // Save to repository
    const savedPlayer = await this.userRepository.savePlayer(playerEntity);
    
    return savedPlayer;
  }

  /**
   * Hash password with salt
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }
}