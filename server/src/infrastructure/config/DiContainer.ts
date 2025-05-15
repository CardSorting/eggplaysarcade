import { GameRepository } from '../../domain/repositories/GameRepository';
import { CategoryRepository } from '../../domain/repositories/CategoryRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { RatingRepository } from '../../domain/repositories/RatingRepository';

import { MemGameRepository } from '../persistence/MemGameRepository';
import { MemCategoryRepository } from '../persistence/MemCategoryRepository';
import { MemUserRepository } from '../persistence/MemUserRepository';
import { MemRatingRepository } from '../persistence/MemRatingRepository';

import { CreateGameCommand } from '../../application/commands/CreateGameCommand';
import { CreateRatingCommand } from '../../application/commands/CreateRatingCommand';
import { CreateUserCommand } from '../../application/commands/CreateUserCommand';
import { UpdateGamePlayersCommand } from '../../application/commands/UpdateGamePlayersCommand';

import { GetGamesQuery } from '../../application/queries/GetGamesQuery';
import { GetGameByIdQuery } from '../../application/queries/GetGameByIdQuery';
import { GetFeaturedGamesQuery } from '../../application/queries/GetFeaturedGamesQuery';
import { GetPopularGamesQuery } from '../../application/queries/GetPopularGamesQuery';
import { GetCategoriesQuery } from '../../application/queries/GetCategoriesQuery';

/**
 * Dependency Injection Container
 * This provides a centralized place to manage application dependencies
 * and follows the Dependency Inversion Principle from SOLID
 */
export class DiContainer {
  private static instance: DiContainer;
  
  // Repositories
  private readonly gameRepository: GameRepository;
  private readonly categoryRepository: CategoryRepository;
  private readonly userRepository: UserRepository;
  private readonly ratingRepository: RatingRepository;
  
  // Commands
  private readonly createGameCommand: CreateGameCommand;
  private readonly createRatingCommand: CreateRatingCommand;
  private readonly createUserCommand: CreateUserCommand;
  private readonly updateGamePlayersCommand: UpdateGamePlayersCommand;
  
  // Queries
  private readonly gamesQuery: GetGamesQuery;
  private readonly gameByIdQuery: GetGameByIdQuery;
  private readonly featuredGamesQuery: GetFeaturedGamesQuery;
  private readonly popularGamesQuery: GetPopularGamesQuery;
  private readonly categoriesQuery: GetCategoriesQuery;
  
  private constructor() {
    // Initialize repositories
    this.gameRepository = new MemGameRepository();
    this.categoryRepository = new MemCategoryRepository();
    this.userRepository = new MemUserRepository();
    this.ratingRepository = new MemRatingRepository();
    
    // Initialize commands
    this.createGameCommand = new CreateGameCommand(
      this.gameRepository,
      this.categoryRepository,
      this.userRepository
    );
    
    this.createRatingCommand = new CreateRatingCommand(
      this.ratingRepository,
      this.gameRepository
    );
    
    this.createUserCommand = new CreateUserCommand(
      this.userRepository
    );
    
    this.updateGamePlayersCommand = new UpdateGamePlayersCommand(
      this.gameRepository
    );
    
    // Initialize queries
    this.gamesQuery = new GetGamesQuery(
      this.gameRepository,
      this.categoryRepository
    );
    
    this.gameByIdQuery = new GetGameByIdQuery(
      this.gameRepository,
      this.categoryRepository,
      this.userRepository,
      this.ratingRepository
    );
    
    this.featuredGamesQuery = new GetFeaturedGamesQuery(
      this.gameRepository,
      this.categoryRepository
    );
    
    this.popularGamesQuery = new GetPopularGamesQuery(
      this.gameRepository,
      this.categoryRepository
    );
    
    this.categoriesQuery = new GetCategoriesQuery(
      this.categoryRepository,
      this.gameRepository
    );
  }
  
  static getInstance(): DiContainer {
    if (!DiContainer.instance) {
      DiContainer.instance = new DiContainer();
    }
    return DiContainer.instance;
  }
  
  // Repository getters
  getGameRepository(): GameRepository {
    return this.gameRepository;
  }
  
  getCategoryRepository(): CategoryRepository {
    return this.categoryRepository;
  }
  
  getUserRepository(): UserRepository {
    return this.userRepository;
  }
  
  getRatingRepository(): RatingRepository {
    return this.ratingRepository;
  }
  
  // Command getters
  getCreateGameCommand(): CreateGameCommand {
    return this.createGameCommand;
  }
  
  getCreateRatingCommand(): CreateRatingCommand {
    return this.createRatingCommand;
  }
  
  getCreateUserCommand(): CreateUserCommand {
    return this.createUserCommand;
  }
  
  getUpdateGamePlayersCommand(): UpdateGamePlayersCommand {
    return this.updateGamePlayersCommand;
  }
  
  // Query getters
  getGamesQuery(): GetGamesQuery {
    return this.gamesQuery;
  }
  
  getGameByIdQuery(): GetGameByIdQuery {
    return this.gameByIdQuery;
  }
  
  getFeaturedGamesQuery(): GetFeaturedGamesQuery {
    return this.featuredGamesQuery;
  }
  
  getPopularGamesQuery(): GetPopularGamesQuery {
    return this.popularGamesQuery;
  }
  
  getCategoriesQuery(): GetCategoriesQuery {
    return this.categoriesQuery;
  }
}