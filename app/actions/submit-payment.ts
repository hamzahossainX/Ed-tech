"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { paymentTransactions, users } from "@/db/schema";
import { getSignedInEmail } from "@/lib/require-session";

const paymentFormSchema = z.object({
  packageType: z.enum(["Premium", "Diamond"]),
  senderNumber: z
    .string()
    .trim()
    .min(11, "Enter a valid 11-digit mobile number.")
    .max(14, "Enter a valid mobile number.")
    .regex(/^0\d{10,13}$/, "Enter a valid bKash/Nagad number starting with 0."),
  transactionId: z
    .string()
    .trim()
    .min(4, "Transaction ID must be at least 4 characters.")
    .max(30, "Transaction ID is too long."),
});

export type SubmitPaymentResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function submitPayment(
  formData: FormData,
): Promise<SubmitPaymentResult> {
  const signedInEmail = await getSignedInEmail();
  if (!signedInEmail) {
    return { success: false, error: "Please sign in to submit a payment." };
  }

  const parsed = paymentFormSchema.safeParse({
    packageType: formData.get("packageType"),
    senderNumber: formData.get("senderNumber"),
    transactionId: formData.get("transactionId"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid form data.";
    return { success: false, error: firstError };
  }

  const signedInUser = await db.query.users.findFirst({
    where: eq(users.email, signedInEmail),
    columns: { id: true },
  });

  if (!signedInUser) {
    return { success: false, error: "Could not find your account. Please sign in again." };
  }

  try {
    await db.insert(paymentTransactions).values({
      userId: signedInUser.id,
      packageType: parsed.data.packageType,
      senderNumber: parsed.data.senderNumber,
      transactionId: parsed.data.transactionId,
    });

    return {
      success: true,
      message:
        "Thanks for your purchase! Your confirmation is pending. Once verified by an admin, you will unlock unlimited access.",
    };
  } catch (error) {
    console.error("PAYMENT SUBMISSION ERROR:", error);
    return {
      success: false,
      error: "We couldn't save your payment details. Please try again.",
    };
  }
}
