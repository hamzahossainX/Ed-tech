"use server";

import { getCloudinary } from "@/lib/cloudinary";

export async function createUploadSignature() {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "learnx/public";
  const signature = getCloudinary().utils.api_sign_request(
    { folder, timestamp },
    process.env.CLOUDINARY_API_SECRET!,
  );

  return {
    timestamp,
    folder,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
  };
}
