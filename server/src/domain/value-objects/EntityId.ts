/**
 * Base ValueObject for all entity identifiers
 * 
 * This follows Domain-Driven Design principles where IDs are treated as
 * value objects with their own business logic and validation rules.
 */
export abstract class EntityId {
  protected readonly value: string | number;

  constructor(value: string | number) {
    this.validate(value);
    this.value = value;
  }

  /**
   * Validates if the provided value is a valid ID
   * Subclasses may override with specific validation rules
   */
  protected validate(value: string | number): void {
    if (value === undefined || value === null) {
      throw new Error('Entity ID cannot be null or undefined');
    }

    if (typeof value === 'string' && value.trim() === '') {
      throw new Error('Entity ID cannot be an empty string');
    }

    if (typeof value === 'number' && (isNaN(value) || value <= 0)) {
      throw new Error('Entity ID must be a positive number');
    }
  }

  /**
   * Gets the ID value
   */
  toString(): string {
    return String(this.value);
  }

  /**
   * Compare equality with another EntityId
   */
  equals(id?: EntityId): boolean {
    if (id === null || id === undefined) {
      return false;
    }
    if (!(id instanceof EntityId)) {
      return false;
    }
    return this.toString() === id.toString();
  }
}