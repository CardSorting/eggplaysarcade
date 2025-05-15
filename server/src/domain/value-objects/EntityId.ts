/**
 * Entity identifier value object
 * Following the Value Object pattern from Domain-Driven Design
 */
export class EntityId {
  constructor(public readonly value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error('Entity ID must be a positive integer');
    }
  }

  public toString(): string {
    return String(this.value);
  }
  
  public equals(other: EntityId): boolean {
    if (!(other instanceof EntityId)) {
      return false;
    }
    return this.value === other.value;
  }
}