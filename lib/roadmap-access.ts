// Shared roadmap access rules.
//
// These values are imported by both the Server Action that enforces them and
// the hero form that explains them, so the copy a learner reads can never drift
// from the quota the server actually applies. The server remains the only
// authority: the client checks exist to avoid a pointless round trip and a
// misleading loading state, never to grant access.

/** Roadmap generation is a members-only feature. */
export const AUTH_REQUIRED_ERROR = "AUTH_REQUIRED";

/** The signed-in learner has spent today's allowance. */
export const LIMIT_REACHED_ERROR = "LIMIT_REACHED";

/** Generations a signed-in learner may run per calendar day. */
export const DAILY_GENERATION_LIMIT = 5;

export const AUTH_REQUIRED_MESSAGE = "Please log in to generate your custom roadmap.";

export const DAILY_LIMIT_MESSAGE =
  `You've reached your daily limit of ${DAILY_GENERATION_LIMIT} roadmaps! Come back tomorrow.`;
