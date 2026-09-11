import "server-only";

function parseAdminEmails(value: string | undefined) {
  if (!value?.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((email): email is string => typeof email === "string");
    }
  } catch {
    // Also accept a comma-separated value for simpler hosting dashboards.
  }

  return value.split(",");
}

const adminEmails = new Set(
  parseAdminEmails(process.env.ADMIN_EMAILS)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export function isAdminEmail(email: string | null | undefined) {
  return Boolean(email && adminEmails.has(email.trim().toLowerCase()));
}
