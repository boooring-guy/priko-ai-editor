import { db } from "../src/db";
import { user } from "../src/db/schema";

async function checkDb() {
  console.log("🔍 Checking Database Users...");
  try {
    const users = await db.select().from(user);
    console.log(`Total users: ${users.length}`);
    users.forEach((u) => {
      console.log(`- User: ${u.email}, Image: ${u.image ? "PRESENT" : "NULL"}`);
      if (u.image) console.log(`  URL: ${u.image.substring(0, 50)}...`);
    });
  } catch (error) {
    console.error("❌ DB Check Failed:", error);
  }
}

checkDb();
