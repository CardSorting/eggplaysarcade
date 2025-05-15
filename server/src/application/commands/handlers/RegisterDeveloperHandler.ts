import { storage } from "../../../../storage";
import { RegisterDeveloperCommand } from "../RegisterDeveloperCommand";
import { DeveloperEntity } from "../../../domain/entities/UserEntity";
import { User } from "@shared/schema";

export class RegisterDeveloperHandler {
  /**
   * Handle the register developer command
   * @param command The register developer command
   * @returns The created user
   */
  async handle(command: RegisterDeveloperCommand): Promise<User> {
    // Check if username is already taken
    const existingUser = await storage.getUserByUsername(command.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }
    
    // Create new developer entity
    const developer = new DeveloperEntity({
      username: command.username,
      password: command.password,
      email: command.email,
      displayName: command.displayName,
      role: command.role,
      companyName: command.companyName,
      portfolio: command.portfolio
    });
    
    // Save developer to database
    const user = await storage.createUser(developer.toObject());
    
    return user;
  }
}