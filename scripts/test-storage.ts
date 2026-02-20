import { db } from "../src/db";
import { user } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function testStorage() {
  console.log("🧪 Testing Image Storage...");
  const testId = `test-${Date.now()}`;
  const testEmail = `test-${Date.now()}@example.com`;
  const testImageUrl = "https://example.com/test-image.jpg";

  try {
    await db.insert(user).values({
      id: testId,
      name: "Test User",
      email: testEmail,
      image: testImageUrl,
      emailVerified: true,
    });
    console.log("✅ Inserted test user with image URL.");

    const [retrieved] = await db.select().from(user).where(eq(user.id, testId));
    console.log("🔍 Retrieved user image:", retrieved?.image || "NULL");

    if (retrieved?.image === testImageUrl) {
      console.log(
        "✨ SUCCESS: Database stored and retrieved the image field correctly.",
      );
    } else {
      console.error("❌ FAILURE: Image field mismatch or NULL.");
    }

    // Cleanup
    await db.delete(user).where(eq(user.id, testId));
    console.log("🧹 Cleaned up test user.");
  } catch (error) {
    console.error("💥 TEST CRASHED:", error);
  }
}

testStorage();
