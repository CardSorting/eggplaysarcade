/**
 * EntityId value object
 * Following the Value Object pattern from Domain-Driven Design
 * It encapsulates the identity concept and ensures its immutability
 */
export class EntityId {
  private readonly _value: number;

  /**
   * Create a new EntityId
   * @param value Numeric identifier
   */
  constructor(value: number) {
    if (value <= 0) {
      throw new Error('Entity ID must be a positive number');
    }
    this._value = value;
  }

  /**
   * Get the ID value
   */
  get value(): number {
    return this._value;
  }

  /**
   * Compare this EntityId with another
   * @param other The other EntityId to compare with
   * @returns True if the IDs are equal
   */
  equals(other: EntityId): boolean {
    if (!(other instanceof EntityId)) {
      return false;
    }
    return this._value === other._value;
  }

  /**
   * String representation of the EntityId
   */
  toString(): string {
    return `${this._value}`;
  }
}