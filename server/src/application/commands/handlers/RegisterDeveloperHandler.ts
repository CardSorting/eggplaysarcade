import { RegisterDeveloperCommand } from "../RegisterDeveloperCommand";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { DeveloperEntity } from "../../../domain/entities/DeveloperEntity";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

// Password hashing utility (same as in auth.ts)
const scryptAsync = promisify(scrypt);

/**
 * Handler for RegisterDeveloperCommand
 * Following CQRS pattern, this handler is responsible for registering a game developer
 */
export class RegisterDeveloperHandler {
  constructor(private readonly userRepository: IUserRepository) {}

  async handle(command: RegisterDeveloperCommand): Promise<DeveloperEntity> {
    // Check if username already exists
    const usernameExists = await this.userRepository.usernameExists(command.username);
    if (usernameExists) {
      throw new Error("Username already exists");
    }

    // Hash password
    const hashedPassword = await this.hashPassword(command.password);

    // Create developer entity
    const developerEntity = new DeveloperEntity(
      command.username,
      hashedPassword,
      {
        email: command.email,
        displayName: command.displayName,
        companyName: command.companyName,
        portfolio: command.portfolio,
        avatarUrl: command.avatarUrl,
        bio: command.bio
      }
    );

    // Save to repository
    const savedDeveloper = await this.userRepository.saveDeveloper(developerEntity);
    
    return savedDeveloper;
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