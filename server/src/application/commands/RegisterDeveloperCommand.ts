/**
 * Command for game developer registration
 * Following CQRS pattern, this command represents the intent to register a game developer
 */
export class RegisterDeveloperCommand {
  constructor(
    public readonly username: string,
    public readonly password: string,
    public readonly email: string | null = null,
    public readonly displayName: string | null = null,
    public readonly companyName: string | null = null,
    public readonly portfolio: string | null = null,
    public readonly avatarUrl: string | null = null,
    public readonly bio: string | null = null
  ) {}
}