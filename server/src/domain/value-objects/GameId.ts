import { EntityId } from './EntityId';

/**
 * Value object representing a Game ID
 * 
 * This follows Domain-Driven Design principles and encapsulates
 * the concept of a unique game identifier.
 */
export class GameId extends EntityId {
  /**
   * Create a GameId from a number
   * 
   * @param value The numeric ID
   * @returns A new GameId instance
   */
  static fromNumber(value: number): GameId {
    return new GameId(value);
  }
  
  /**
   * Create a GameId from a string, parsing it as a number
   * 
   * @param value The string representation of the ID
   * @returns A new GameId instance
   */
  static fromString(value: string): GameId {
    const numberValue = parseInt(value, 10);
    if (isNaN(numberValue)) {
      throw new Error(`Cannot create GameId from invalid string: ${value}`);
    }
    return new GameId(numberValue);
  }

  /**
   * Additional validation specific to GameIds
   */
  protected validate(value: string | number): void {
    super.validate(value);
    
    // Add game-specific validation logic here if needed
    // For example, games might have a specific ID format or range
  }
}