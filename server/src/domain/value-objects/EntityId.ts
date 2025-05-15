/**
 * Value object representing an entity identifier
 * Using Value Object pattern from Domain-Driven Design
 */
export class EntityId {
  private readonly _value: number;

  constructor(value: number) {
    if (value <= 0) {
      throw new Error('Entity ID must be a positive number');
    }
    this._value = value;
  }

  /**
   * Get the underlying number value of this ID
   */
  public get value(): number {
    return this._value;
  }

  /**
   * Compare this entity ID with another for equality
   */
  public equals(other: EntityId | null): boolean {
    if (!other) {
      return false;
    }
    
    return this._value === other._value;
  }

  /**
   * Convert this entity ID to a string
   */
  public toString(): string {
    return String(this._value);
  }

  /**
   * Convert this entity ID to a JSON compatible value
   */
  public toJSON(): number {
    return this._value;
  }
}