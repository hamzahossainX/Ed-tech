"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { registrationSchema, type RegistrationInput } from "@/lib/auth-validation";

export type RegisterResult = { success: true } | { success: false; message: string; fields?: Partial<Record<keyof RegistrationInput, string>> };

export async function registerUser(input: RegistrationInput): Promise<RegisterResult> {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) {
    const fields: Partial<Record<keyof RegistrationInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof RegistrationInput | undefined;
      if (field && !fields[field]) fields[field] = issue.message;
    }
    return { success: false, message: "Please correct the highlighted fields.", fields };
  }

  const { firstName, lastName, email, password } = parsed.data;
  const name = `${firstName} ${lastName}`;
  const existing = await db.query.users.findFirst({ where: eq(users.email, email), columns: { id: true, password: true } });
  if (existing) {
    return { success: false, message: existing.password ? "An account already exists for this email." : "This email uses GitHub sign-in. Continue with GitHub instead.", fields: { email: "Email is already registered" } };
  }

  const passwordHash = await hash(password, 12);

  try {
    await db.insert(users).values({ name, email, password: passwordHash });
    return { success: true };
  } catch (error) {
    console.error("Registration failed", error);
    return { success: false, message: "Could not create your account. Please try again." };
  }
}
