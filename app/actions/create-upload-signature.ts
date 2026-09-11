"use server";

import { getCloudinary } from "@/lib/cloudinary";
import { requireSignedInEmail } from "@/lib/require-session";

export async function createUploadSignature() {
  // Nothing in the app calls this yet, but a Server Action is a live HTTP
  // endpoint regardless: unguarded, it signed arbitrary uploads into the
  // project's Cloudinary account for any anonymous caller.
  await requireSignedInEmail();

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
