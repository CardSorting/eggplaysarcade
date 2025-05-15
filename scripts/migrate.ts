import { db } from '../server/db';
import * as schema from '../shared/schema';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('Starting database migration...');
  
  try {
    // Check if users table exists
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tableNames = tables.rows.map((row: any) => row.table_name);
    console.log('Existing tables:', tableNames);
    
    // Create users table if it doesn't exist or update it
    if (!tableNames.includes('users')) {
      console.log('Creating users table...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'player',
          email TEXT,
          avatar_url TEXT,
          bio TEXT,
          display_name TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          last_login TIMESTAMP,
          is_verified BOOLEAN DEFAULT FALSE,
          company_name TEXT,
          portfolio_url TEXT
        )
      `);
    } else {
      console.log('Users table exists, checking for missing columns...');
      
      // Check if role column exists
      const columns = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public'
      `);
      
      const columnNames = columns.rows.map((row: any) => row.column_name);
      console.log('Existing columns in users table:', columnNames);
      
      // Add missing columns
      if (!columnNames.includes('role')) {
        console.log('Adding role column...');
        await db.execute(sql`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'player'`);
      }
      
      if (!columnNames.includes('company_name')) {
        console.log('Adding company_name column...');
        await db.execute(sql`ALTER TABLE users ADD COLUMN company_name TEXT`);
      }
      
      if (!columnNames.includes('portfolio_url')) {
        console.log('Adding portfolio_url column...');
        await db.execute(sql`ALTER TABLE users ADD COLUMN portfolio_url TEXT`);
      }
      
      if (!columnNames.includes('is_verified')) {
        console.log('Adding is_verified column...');
        await db.execute(sql`ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE`);
      }
    }
    
    // Create or update other tables
    console.log('Creating/updating categories table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        icon TEXT NOT NULL
      )
    `);
    
    console.log('Creating/updating games table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        instructions TEXT NOT NULL,
        thumbnail_url TEXT NOT NULL,
        game_url TEXT NOT NULL,
        category_id INTEGER NOT NULL,
        tags TEXT[],
        published_at TIMESTAMP NOT NULL DEFAULT NOW(),
        user_id INTEGER NOT NULL,
        rating INTEGER DEFAULT 0,
        players INTEGER DEFAULT 0
      )
    `);
    
    console.log('Creating/updating ratings table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        game_id INTEGER NOT NULL,
        value INTEGER NOT NULL
      )
    `);
    
    console.log('Creating/updating wishlists table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS wishlists (
        user_id INTEGER NOT NULL,
        game_id INTEGER NOT NULL,
        added_at TIMESTAMP NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, game_id)
      )
    `);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrate();