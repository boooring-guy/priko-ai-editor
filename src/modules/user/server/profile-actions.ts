"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { user } from "@/db/schema";
import { deleteFileFromS3, uploadFileToS3 } from "@/lib/s3";
import { getCurrentUser } from "@/modules/auth/server/get-current-user";

export async function updateProfileImage(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const file = formData.get("image") as File;
  if (!file) {
    throw new Error("No file uploaded");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileExt = file.name.split(".").pop();
  const fileName = `user/${currentUser.id}/profile-${Date.now()}.${fileExt}`;

  try {
    // 1. Upload new image to S3
    const imageUrl = await uploadFileToS3(buffer, fileName, file.type);

    // 2. Get old image to delete later (optional but good practice)
    const [existingUser] = await db
      .select({ image: user.image })
      .from(user)
      .where(eq(user.id, currentUser.id));

    // 3. Update database with new image URL
    await db
      .update(user)
      .set({ image: imageUrl })
      .where(eq(user.id, currentUser.id));

    // 4. Delete old image from S3 if it was an S3 URL
    if (existingUser?.image?.includes("amazonaws.com")) {
      const oldKey = existingUser.image.split(".com/").pop();
      if (oldKey) {
        await deleteFileFromS3(oldKey).catch((err) => {
          console.error("Failed to delete old profile image from S3:", err);
        });
      }
    }

    revalidatePath("/profile"); // Adjust path as needed
    return { success: true, imageUrl };
  } catch (error) {
    console.error("Profile upload error:", error);
    return { success: false, error: "Failed to upload profile image" };
  }
}
