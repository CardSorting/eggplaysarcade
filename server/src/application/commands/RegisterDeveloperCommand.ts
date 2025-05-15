import { User, UserRole } from "@shared/schema";

export class RegisterDeveloperCommand {
  public username: string;
  public password: string;
  public email: string | null;
  public displayName: string | null;
  public companyName: string | null;
  public portfolio: string | null;
  public role: UserRole;

  constructor(data: {
    username: string;
    password: string;
    role: UserRole;
    email?: string | null;
    displayName?: string | null;
    companyName?: string | null;
    portfolio?: string | null;
  }) {
    this.username = data.username;
    this.password = data.password;
    this.email = data.email || null;
    this.displayName = data.displayName || null;
    this.companyName = data.companyName || null;
    this.portfolio = data.portfolio || null;
    this.role = UserRole.GAME_DEVELOPER; // Ensure it's always a game developer
  }
}