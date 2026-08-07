import { cookies } from "next/headers";

const GUEST_COOKIE = "learnx_guest_id";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function getOrCreateGuestId() {
  const cookieStore = await cookies();
  const existingGuestId = cookieStore.get(GUEST_COOKIE)?.value;
  if (existingGuestId) return existingGuestId;

  const guestId = crypto.randomUUID();
  cookieStore.set(GUEST_COOKIE, guestId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: THIRTY_DAYS,
    path: "/",
  });

  return guestId;
}
