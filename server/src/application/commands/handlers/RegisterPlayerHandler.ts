import { storage } from "../../../../storage";
import { RegisterPlayerCommand } from "../RegisterPlayerCommand";
import { PlayerEntity } from "../../../domain/entities/UserEntity";
import { User } from "@shared/schema";

export class RegisterPlayerHandler {
  /**
   * Handle the register player command
   * @param command The register player command
   * @returns The created user
   */
  async handle(command: RegisterPlayerCommand): Promise<User> {
    // Check if username is already taken
    const existingUser = await storage.getUserByUsername(command.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }
    
    // Create new player entity
    const player = new PlayerEntity({
      username: command.username,
      password: command.password,
      email: command.email,
      displayName: command.displayName,
      role: command.role
    });
    
    // Save player to database
    const user = await storage.createUser(player.toObject());
    
    return user;
  }
}