import { db } from "../server/db";
import { users, UserRole } from "../shared/schema";
import { randomBytes, scrypt as scryptCallback } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scrypt(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  try {
    console.log("🔑 Creating admin user...");
    
    // Set admin credentials
    const username = "admin";
    const password = "admin123"; // This would be securely handled in production
    
    // Check if admin already exists
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, username)
    });
    
    if (existingAdmin) {
      console.log("⚠️ Admin user already exists!");
      return;
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Insert admin user
    const [adminUser] = await db.insert(users).values({
      username,
      password: hashedPassword,
      role: UserRole.ADMIN,
      email: "admin@example.com",
      displayName: "System Administrator",
      isVerified: true
    }).returning();
    
    console.log(`✅ Created admin user: ${adminUser.username}`);
    console.log(`🔐 Admin dashboard available at: /dashboard`);
    console.log(`🔑 Login with username: ${username} and password: ${password}`);
    
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    // Clean up database connections
    if (db.$pool) {
      await db.$pool.end();
    }
    process.exit(0);
  }
}

createAdminUser();