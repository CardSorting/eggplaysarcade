/**
 * Generic Command Handler interface for the CQRS pattern
 * 
 * Each command handler is responsible for executing the business logic
 * required by a specific command.
 */
export interface CommandHandler<TCommand, TResult> {
  /**
   * Executes the business logic associated with the command
   * 
   * @param command The command containing all parameters required to execute
   * @returns A promise with the result of the command execution 
   */
  handle(command: TCommand): Promise<TResult>;
}