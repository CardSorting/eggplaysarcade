/**
 * Permission value object
 * Represents a single permission in the system
 * Following DDD principles for encapsulating domain logic
 */
export class Permission {
  constructor(private readonly _value: string) {
    this.validate();
  }
  
  get value(): string {
    return this._value;
  }
  
  private validate(): void {
    if (!this._value || typeof this._value !== 'string' || this._value.trim() === '') {
      throw new Error('Permission value must be a non-empty string');
    }
    
    // Additional validation logic can be added here
    // Such as checking against a predefined list of valid permissions
  }
  
  equals(permission: Permission): boolean {
    return this._value === permission.value;
  }
  
  toString(): string {
    return this._value;
  }
}