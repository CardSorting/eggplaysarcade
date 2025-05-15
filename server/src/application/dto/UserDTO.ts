import { User } from '../../domain/entities/User';
import { GameDTO } from './GameDTO';

/**
 * DTO for User entities
 */
export class UserDTO {
  id: number;
  username: string;
  games?: GameDTO[];

  constructor(user: User) {
    this.id = user.id.value;
    this.username = user.username;
    
    if (user.games.length > 0) {
      this.games = user.games.map(game => new GameDTO(game));
    }
  }

  static fromEntity(user: User): UserDTO {
    return new UserDTO(user);
  }

  static fromEntities(users: User[]): UserDTO[] {
    return users.map(user => UserDTO.fromEntity(user));
  }
}