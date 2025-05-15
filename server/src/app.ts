import express, { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { Router } from 'express';
import { setupAuthRoutes } from './interfaces/routes/authRoutes';
import { UserRepository } from './infrastructure/persistence/UserRepository';
import cors from 'cors';
import { logAuthStatus } from '../middleware/debugMiddleware';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import connectPg from 'connect-pg-simple';
import { pool } from '../db';

const scryptAsync = promisify(scrypt);

/**
 * Application setup following the Clean Architecture pattern
 * This is the entry point for the application
 */
export async function createApp(): Promise<Express> {
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(cors());
  
  // Session store with PostgreSQL
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({
    pool,
    createTableIfMissing: true
  });
  
  // Session configuration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'game-portal-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };
  
  app.set('trust proxy', 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure authentication
  setupAuthentication();
  
  // API routes
  const apiRouter = express.Router();
  
  // Debug middleware for authentication
  apiRouter.use(logAuthStatus);
  
  // Setup auth routes
  setupAuthRoutes(apiRouter);
  
  // Register API router
  app.use('/api', apiRouter);
  
  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('App error:', err);
    res.status(500).json({ message: 'Internal server error' });
  });
  
  return app;
  
  /**
   * Setup passport authentication
   */
  function setupAuthentication() {
    // Local strategy for username/password authentication
    passport.use(
      new LocalStrategy(async (username, password, done) => {
        try {
          // Find user by username
          const [user] = await db.select().from(users).where(eq(users.username, username));
          
          if (!user) {
            return done(null, false);
          }
          
          // Compare passwords
          const isPasswordValid = await comparePasswords(password, user.password);
          
          if (!isPasswordValid) {
            return done(null, false);
          }
          
          // Update last login time
          await db
            .update(users)
            .set({ lastLogin: new Date() })
            .where(eq(users.id, user.id));
          
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      })
    );
    
    // User serialization for session storage
    passport.serializeUser((user, done) => {
      done(null, (user as any).id);
    });
    
    // User deserialization from session
    passport.deserializeUser(async (id: number, done) => {
      try {
        const userRepository = new UserRepository();
        const user = await userRepository.findById(id);
        done(null, user ? convertUserEntityToSession(user) : null);
      } catch (err) {
        done(err);
      }
    });
  }
  
  /**
   * Compare plain password with hashed password
   */
  async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
    const [hashed, salt] = stored.split('.');
    if (!hashed || !salt) return false;
    
    const hashedBuf = Buffer.from(hashed, 'hex');
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  }
  
  /**
   * Convert user entity to session object
   */
  function convertUserEntityToSession(entity: any) {
    return {
      id: entity.getId(),
      username: entity.getUsername(),
      role: entity.getRole(),
      email: entity.getEmail(),
      bio: entity.getBio(),
      avatarUrl: entity.getAvatarUrl(),
      displayName: entity.getDisplayName(),
      password: entity.getPasswordHash(), // Needed for passport
      isVerified: entity.isUserVerified(),
      createdAt: entity.getCreatedAt(),
      lastLogin: entity.getLastLogin()
    };
  }
}