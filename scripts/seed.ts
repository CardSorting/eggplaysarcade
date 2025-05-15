import { db } from "../server/db";
import { users, categories, games } from "../shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");
  
  try {
    // Insert demo user
    const [demoUser] = await db.insert(users).values({
      username: "demo_user",
      password: "password", // In a real app this would be hashed
    }).returning();
    
    console.log(`✅ Created user: ${demoUser.username}`);
    
    // Insert categories
    const categoriesData = [
      { name: "Action", icon: "ri-sword-line" },
      { name: "Puzzle", icon: "ri-puzzle-line" },
      { name: "Strategy", icon: "ri-chess-line" },
      { name: "Adventure", icon: "ri-treasure-map-line" },
      { name: "Arcade", icon: "ri-gamepad-line" },
    ];
    
    const insertedCategories = await db.insert(categories).values(categoriesData).returning();
    console.log(`✅ Created ${insertedCategories.length} categories`);
    
    // Insert sample games
    const gamesData = [
      {
        title: "Block Puzzle",
        description: "A simple but addictive puzzle game where you need to fit blocks into a grid.",
        instructions: "Drag and drop the blocks to fill rows and columns. Complete lines to clear them and score points.",
        thumbnailUrl: "/uploads/thumbnails/1685432900000-123456789.jpg",
        gameUrl: "/uploads/games/1685432900000-987654321.html",
        categoryId: insertedCategories[1].id, // Puzzle category
        tags: ["puzzle", "blocks", "casual"],
        userId: demoUser.id,
      },
      {
        title: "Space Shooter",
        description: "Classic space shooter game with multiple levels and power-ups.",
        instructions: "Use arrow keys to move and space to shoot. Collect power-ups and defeat enemies.",
        thumbnailUrl: "/uploads/thumbnails/1685432900000-123456790.jpg",
        gameUrl: "/uploads/games/1685432900000-987654322.html",
        categoryId: insertedCategories[0].id, // Action category
        tags: ["shooter", "space", "arcade"],
        userId: demoUser.id,
      },
      {
        title: "Chess Master",
        description: "Play chess against an AI opponent with multiple difficulty levels.",
        instructions: "Click on a piece to select it, then click on a destination square to move.",
        thumbnailUrl: "/uploads/thumbnails/1685432900000-123456791.jpg",
        gameUrl: "/uploads/games/1685432900000-987654323.html",
        categoryId: insertedCategories[2].id, // Strategy category
        tags: ["chess", "strategy", "board"],
        userId: demoUser.id,
      },
    ];
    
    const insertedGames = await db.insert(games).values(gamesData).returning();
    console.log(`✅ Created ${insertedGames.length} games`);
    
    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close the connection
    await db.end?.();
    process.exit(0);
  }
}

seed();