import { GameRepository } from "../../domain/repositories/GameRepository";
import { CategoryRepository } from "../../domain/repositories/CategoryRepository";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { RatingRepository } from "../../domain/repositories/RatingRepository";

import { MemGameRepository } from "../persistence/MemGameRepository";
import { MemCategoryRepository } from "../persistence/MemCategoryRepository";
import { MemUserRepository } from "../persistence/MemUserRepository";
import { MemRatingRepository } from "../persistence/MemRatingRepository";

// Import database repositories
import { DbGameRepository } from "../persistence/DbGameRepository";

import { GameController } from "../../interfaces/api/controllers/GameController";
import { CategoryController } from "../../interfaces/api/controllers/CategoryController";
import { UserController } from "../../interfaces/api/controllers/UserController";

/**
 * A simple dependency injection container
 * This manages the creation and lifecycle of service instances
 */
export class DiContainer {
  private static instance: DiContainer;
  private services: Map<string, any>;

  private constructor() {
    this.services = new Map<string, any>();
    this.registerServices();
  }

  /**
   * Get the singleton instance of the container
   */
  public static getInstance(): DiContainer {
    if (!DiContainer.instance) {
      DiContainer.instance = new DiContainer();
    }
    return DiContainer.instance;
  }

  /**
   * Register all services
   */
  private registerServices(): void {
    // Register repositories
    this.registerSingleton<GameRepository>("GameRepository", new MemGameRepository());
    this.registerSingleton<CategoryRepository>("CategoryRepository", new MemCategoryRepository());
    this.registerSingleton<UserRepository>("UserRepository", new MemUserRepository());
    this.registerSingleton<RatingRepository>("RatingRepository", new MemRatingRepository());

    // Register controllers
    this.registerSingleton<GameController>("GameController", new GameController(
      this.get<GameRepository>("GameRepository"),
      this.get<CategoryRepository>("CategoryRepository"),
      this.get<UserRepository>("UserRepository"),
      this.get<RatingRepository>("RatingRepository")
    ));

    this.registerSingleton<CategoryController>("CategoryController", new CategoryController(
      this.get<CategoryRepository>("CategoryRepository"),
      this.get<GameRepository>("GameRepository")
    ));

    this.registerSingleton<UserController>("UserController", new UserController(
      this.get<UserRepository>("UserRepository"),
      this.get<GameRepository>("GameRepository"),
      this.get<RatingRepository>("RatingRepository")
    ));
  }

  /**
   * Register a singleton service
   */
  public registerSingleton<T>(name: string, instance: T): void {
    this.services.set(name, instance);
  }

  /**
   * Get a service by name
   */
  public get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found in container`);
    }
    return service as T;
  }
}