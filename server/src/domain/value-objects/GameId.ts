import { v4 as uuidv4 } from 'uuid';
import { customAlphabet } from 'nanoid';

/**
 * GameId is a value object that provides a unique, readable ID for games
 * Value objects in DDD are immutable and identified by their value, not by identity
 */
export class GameId {
  private readonly _value: string;
  
  /**
   * Create a new GameId with a specific value
   * @param value The string representation of the GameId
   * @throws Error if the provided ID format is invalid
   */
  constructor(value?: string) {
    if (!value) {
      // Generate a new ID if none is provided
      this._value = GameId.generate();
    } else if (GameId.isValid(value)) {
      this._value = value;
    } else {
      throw new Error(`Invalid GameId format: ${value}`);
    }
  }
  
  /**
   * Get the string representation of the GameId
   */
  get value(): string {
    return this._value;
  }
  
  /**
   * Generate a new unique game ID
   * Format: GAME-XXXX-XXXX-XXXX where X is alphanumeric
   */
  static generate(): string {
    // Using nanoid to generate a readable ID that's shorter than UUIDs
    // but still has sufficient entropy to avoid collisions
    const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12);
    const id = nanoid();
    
    // Format into GAME-XXXX-XXXX-XXXX
    return `GAME-${id.substring(0, 4)}-${id.substring(4, 8)}-${id.substring(8, 12)}`;
  }
  
  /**
   * Check if a string is a valid GameId
   */
  static isValid(value: string): boolean {
    // Check against the expected format: GAME-XXXX-XXXX-XXXX
    return /^GAME-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/.test(value);
  }
  
  /**
   * Convert GameId to string for convenience
   */
  toString(): string {
    return this._value;
  }
  
  /**
   * Check if two GameIds are equal
   */
  equals(other: GameId): boolean {
    return this.value === other.value;
  }
}