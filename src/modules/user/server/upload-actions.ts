"use server";

import { uploadFileToS3 } from "@/lib/s3";

export async function uploadPublicFile(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileExt = file.name.split(".").pop();
  const fileName = `uploads/${crypto.randomUUID()}.${fileExt}`;

  try {
    const imageUrl = await uploadFileToS3(buffer, fileName, file.type);
    return { success: true, url: imageUrl };
  } catch (error) {
    console.error("Anonymous upload error:", error);
    return { success: false, error: "Failed to upload file" };
  }
}
