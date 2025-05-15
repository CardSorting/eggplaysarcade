/**
 * Command for player registration
 * Following CQRS pattern, this command represents the intent to register a player
 */
export class RegisterPlayerCommand {
  constructor(
    public readonly username: string,
    public readonly password: string,
    public readonly email: string | null = null,
    public readonly displayName: string | null = null,
    public readonly avatarUrl: string | null = null,
    public readonly bio: string | null = null
  ) {}
}