import crypto from 'crypto';

/**
 * Value Object representing a unique identifier for an entity
 * By encapsulating IDs as value objects, we make our domain more expressive
 * and have a natural place to add ID-related business logic.
 */
export class EntityId {
  private _value: number;

  constructor(value: number) {
    if (isNaN(value) || value <= 0) {
      throw new Error('Entity ID must be a positive number');
    }
    this._value = value;
  }

  get value(): number {
    return this._value;
  }

  equals(other: EntityId): boolean {
    if (!(other instanceof EntityId)) return false;
    return this._value === other.value;
  }

  toString(): string {
    return String(this._value);
  }

  /**
   * Generates a new EntityId
   * In a real application, this might connect to an ID generation service or sequence
   */
  static generate(): EntityId {
    // Simple implementation for our in-memory store
    // In a real application, you might use a sequence or UUID
    const randomInt = Math.floor(Math.random() * 100000) + 1;
    return new EntityId(randomInt);
  }
}