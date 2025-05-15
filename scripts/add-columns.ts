import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function addMissingColumns() {
  try {
    console.log('Adding missing columns...');
    
    // Add missing columns for auth
    console.log('Adding email column...');
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT`);
    
    console.log('Adding avatar_url column...');
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`);
    
    console.log('Adding bio column...');
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT`);
    
    console.log('Adding display_name column...');
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT`);
    
    console.log('Adding created_at column...');
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW()`);
    
    console.log('Adding last_login column...');
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP`);
    
    console.log('All missing columns added successfully');
  } catch (error) {
    console.error('Error adding columns:', error);
  } finally {
    process.exit(0);
  }
}

addMissingColumns();