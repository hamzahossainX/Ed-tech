import "server-only";
import { auth } from "@/auth";

/**
 * Returns the signed-in learner's email, or null when there is no session.
 *
 * Every Server Action is a publicly reachable HTTP endpoint. A component that
 * renders only for signed-in users is not a gate on the action it calls, so
 * any action that mutates data or spends a paid quota checks this first.
 */
export async function getSignedInEmail() {
  const session = await auth();
  return session?.user?.email ?? null;
}

/** Thrown by actions that have no structured error channel of their own. */
export class SignedOutError extends Error {
  constructor() {
    super("You must be signed in to do that.");
    this.name = "SignedOutError";
  }
}

/** Asserts a session, for actions whose callers surface thrown errors. */
export async function requireSignedInEmail() {
  const email = await getSignedInEmail();
  if (!email) throw new SignedOutError();
  return email;
}
