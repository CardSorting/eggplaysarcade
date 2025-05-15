/**
 * Command to register a new player user
 * Following CQRS pattern - Commands represent intent to change state
 */
export class RegisterPlayerCommand {
  constructor(
    public readonly username: string,
    public readonly password: string,
    public readonly email: string | null,
    public readonly displayName: string | null = null
  ) {}
}