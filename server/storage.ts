import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  games, type Game, type InsertGame,
  ratings, type Rating, type InsertRating,
  wishlists, type Wishlist, type InsertWishlist
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersCount(): Promise<number>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Game methods
  getGames(): Promise<Game[]>;
  getGameById(id: number): Promise<Game | undefined>;
  getGamesByCategory(categoryId: number): Promise<Game[]>;
  getGamesByUserId(userId: number): Promise<Game[]>;
  getFeaturedGames(limit: number): Promise<Game[]>;
  getPopularGames(limit: number): Promise<Game[]>;
  createGame(game: InsertGame): Promise<Game>;
  updateGamePlayers(id: number, increment: number): Promise<Game | undefined>;
  searchGames(query: string): Promise<Game[]>;
  
  // Rating methods
  createRating(rating: InsertRating): Promise<Rating>;
  getGameRatings(gameId: number): Promise<Rating[]>;
  
  // Wishlist methods
  addToWishlist(wishlistItem: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: number, gameId: number): Promise<boolean>;
  getWishlistItems(userId: number): Promise<Game[]>;
  isGameInWishlist(userId: number, gameId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private games: Map<number, Game>;
  private ratings: Map<number, Rating>;
  private wishlistItems: Map<string, Wishlist>;
  private userCurrentId: number;
  private categoryCurrentId: number;
  private gameCurrentId: number;
  private ratingCurrentId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.games = new Map();
    this.ratings = new Map();
    this.wishlistItems = new Map();
    this.userCurrentId = 1;
    this.categoryCurrentId = 1;
    this.gameCurrentId = 1;
    this.ratingCurrentId = 1;
    
    // Initialize with default categories
    const defaultCategories = [
      { name: "Action", icon: "ri-sword-line" },
      { name: "Puzzle", icon: "ri-puzzle-line" },
      { name: "Racing", icon: "ri-car-line" },
      { name: "Arcade", icon: "ri-game-line" },
      { name: "Adventure", icon: "ri-map-line" },
      { name: "Shooter", icon: "ri-rocket-line" }
    ];
    
    defaultCategories.forEach(cat => this.createCategory(cat));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    // Ensure all required fields are present, including developer-specific fields
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "player",
      createdAt: new Date(),
      lastLogin: null,
      companyName: null,
      portfolio: null,
      avatarUrl: null,
      bio: null,
      displayName: null,
      email: null,
      isVerified: false
    };
    this.users.set(id, user);
    return user;
  }
  
  async getUsersCount(): Promise<number> {
    return this.users.size;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  // Game methods
  async getGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }
  
  async getGameById(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }
  
  async getGamesByCategory(categoryId: number): Promise<Game[]> {
    return Array.from(this.games.values()).filter(
      (game) => game.categoryId === categoryId
    );
  }
  
  async getGamesByUserId(userId: number): Promise<Game[]> {
    return Array.from(this.games.values()).filter(
      (game) => game.userId === userId
    );
  }
  
  async getFeaturedGames(limit: number): Promise<Game[]> {
    // For featured games, we'll just return some recent ones
    return Array.from(this.games.values())
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }
  
  async getPopularGames(limit: number): Promise<Game[]> {
    // For popular games, we'll return ones with most players
    return Array.from(this.games.values())
      .sort((a, b) => b.players - a.players)
      .slice(0, limit);
  }
  
  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.gameCurrentId++;
    const game: Game = { 
      ...insertGame, 
      id, 
      publishedAt: new Date(), 
      rating: 0, 
      players: 0 
    };
    this.games.set(id, game);
    return game;
  }
  
  async updateGamePlayers(id: number, increment: number): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;
    
    const updatedGame = { 
      ...game, 
      players: game.players + increment 
    };
    this.games.set(id, updatedGame);
    return updatedGame;
  }
  
  async searchGames(query: string): Promise<Game[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.games.values()).filter(game => 
      game.title.toLowerCase().includes(lowercaseQuery) || 
      game.description.toLowerCase().includes(lowercaseQuery) || 
      (game.tags && game.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
    );
  }
  
  // Rating methods
  async createRating(insertRating: InsertRating): Promise<Rating> {
    const id = this.ratingCurrentId++;
    const rating: Rating = { ...insertRating, id };
    this.ratings.set(id, rating);
    
    // Update game's average rating
    const gameRatings = await this.getGameRatings(insertRating.gameId);
    const game = await this.getGameById(insertRating.gameId);
    
    if (game) {
      const totalRating = gameRatings.reduce((sum, r) => sum + r.value, 0);
      const averageRating = totalRating / gameRatings.length;
      
      const updatedGame = { ...game, rating: Math.round(averageRating) };
      this.games.set(game.id, updatedGame);
    }
    
    return rating;
  }
  
  async getGameRatings(gameId: number): Promise<Rating[]> {
    return Array.from(this.ratings.values()).filter(
      (rating) => rating.gameId === gameId
    );
  }
  
  // Wishlist methods
  async addToWishlist(wishlistItem: InsertWishlist): Promise<Wishlist> {
    const key = `${wishlistItem.userId}-${wishlistItem.gameId}`;
    const newItem: Wishlist = {
      ...wishlistItem,
      addedAt: new Date()
    };
    this.wishlistItems.set(key, newItem);
    return newItem;
  }
  
  async removeFromWishlist(userId: number, gameId: number): Promise<boolean> {
    const key = `${userId}-${gameId}`;
    return this.wishlistItems.delete(key);
  }
  
  async getWishlistItems(userId: number): Promise<Game[]> {
    const wishlistEntries = Array.from(this.wishlistItems.values())
      .filter(item => item.userId === userId);
      
    // Get the actual games for each wishlist item
    const games: Game[] = [];
    for (const entry of wishlistEntries) {
      const game = await this.getGameById(entry.gameId);
      if (game) {
        games.push(game);
      }
    }
    
    // Sort by most recently added
    return games.sort((a, b) => {
      const itemA = Array.from(this.wishlistItems.values())
        .find(item => item.userId === userId && item.gameId === a.id);
      const itemB = Array.from(this.wishlistItems.values())
        .find(item => item.userId === userId && item.gameId === b.id);
      
      if (itemA && itemB) {
        return new Date(itemB.addedAt).getTime() - new Date(itemA.addedAt).getTime();
      }
      return 0;
    });
  }
  
  async isGameInWishlist(userId: number, gameId: number): Promise<boolean> {
    const key = `${userId}-${gameId}`;
    return this.wishlistItems.has(key);
  }
}

// Import the DatabaseStorage implementation
import { DatabaseStorage } from "./storage.database";

// Determine which storage to use based on environment
// Use DatabaseStorage when DATABASE_URL is available, otherwise fall back to MemStorage
export const storage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : new MemStorage();
