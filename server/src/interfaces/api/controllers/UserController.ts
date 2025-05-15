import { Request, Response } from "express";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { GameRepository } from "../../../domain/repositories/GameRepository";
import { RatingRepository } from "../../../domain/repositories/RatingRepository";
import { EntityId } from "../../../domain/value-objects/EntityId";
import { User } from "../../../domain/entities/User";
import { UserDTO, GameDTO, RatingDTO } from "../../../application/dto/GameDTO";

/**
 * Controller for user-related API endpoints
 * Following the Controller pattern from Clean Architecture
 */
export class UserController {
  private readonly userRepository: UserRepository;
  private readonly gameRepository: GameRepository;
  private readonly ratingRepository: RatingRepository;

  constructor(
    userRepository: UserRepository,
    gameRepository: GameRepository,
    ratingRepository: RatingRepository
  ) {
    this.userRepository = userRepository;
    this.gameRepository = gameRepository;
    this.ratingRepository = ratingRepository;
  }

  /**
   * Get all users
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userRepository.findAll();
      const userDTOs = users.map(user => UserDTO.fromEntity(user));
      res.status(200).json(userDTOs);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  /**
   * Get a user by ID
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }
      
      const user = await this.userRepository.findById(new EntityId(id));
      
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      
      // Get user's games
      const games = user.games.length > 0 
        ? user.games 
        : await this.gameRepository.findAll().then(
            allGames => allGames.filter(game => game.userId.equals(user.id!))
          );
      
      // Get user's ratings
      const ratings = user.ratings.length > 0
        ? user.ratings
        : await this.ratingRepository.findByUserId(user.id!);
      
      // Convert to DTO
      const userDTO = UserDTO.fromEntity(user);
      
      // Add games and ratings to response
      const response = {
        ...userDTO,
        games: games.map(game => GameDTO.fromEntity(game)),
        ratings: ratings.map(rating => RatingDTO.fromEntity(rating))
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }

  /**
   * Register a new user
   */
  async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !email || !password) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }
      
      // Check if username already exists
      const existingUser = await this.userRepository.findByUsername(username);
      
      if (existingUser) {
        res.status(409).json({ error: "Username already taken" });
        return;
      }
      
      // Hash the password (in a real app, you'd use a proper password hashing library)
      const passwordHash = `hashed_${password}`;
      
      // Create a new user
      const user = User.create(username, email, passwordHash);
      
      // Save the user
      const savedUser = await this.userRepository.save(user);
      
      // Convert to DTO
      const userDTO = UserDTO.fromEntity(savedUser);
      
      res.status(201).json(userDTO);
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  }
}