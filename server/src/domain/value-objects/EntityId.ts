/**
 * EntityId is a value object representing a unique identifier for an entity.
 * Following the Value Object pattern from Domain-Driven Design.
 */
export class EntityId {
  private readonly _value: number;

  constructor(value: number) {
    if (value <= 0) {
      throw new Error('EntityId must be a positive number');
    }
    this._value = value;
  }

  /**
   * Get the raw value of the ID
   */
  get value(): number {
    return this._value;
  }

  /**
   * Check if two EntityIds are equal
   */
  equals(otherId: EntityId): boolean {
    return this._value === otherId.value;
  }

  /**
   * String representation of the EntityId
   */
  toString(): string {
    return String(this._value);
  }
}