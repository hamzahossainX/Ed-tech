import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthCard } from "@/components/auth/auth-card";

type Props = {
  searchParams: Promise<{ error?: string; registered?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  if (await auth()) redirect("/");
  const { error, registered } = await searchParams;
  const initialError = error
    ? "We could not complete that sign-in. Please try again."
    : undefined;
  const initialNotice = registered
    ? "Your account was created. Sign in to continue."
    : undefined;

  return <AuthCard mode="login" initialError={initialError} initialNotice={initialNotice} />;
}
