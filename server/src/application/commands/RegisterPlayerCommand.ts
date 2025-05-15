import { User, UserRole } from "@shared/schema";

export class RegisterPlayerCommand {
  public username: string;
  public password: string;
  public email: string | null;
  public displayName: string | null;
  public role: UserRole;

  constructor(data: {
    username: string;
    password: string;
    role: UserRole;
    email?: string | null;
    displayName?: string | null;
  }) {
    this.username = data.username;
    this.password = data.password;
    this.email = data.email || null;
    this.displayName = data.displayName || null;
    this.role = UserRole.PLAYER; // Ensure it's always a player
  }
}