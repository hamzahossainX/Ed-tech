import { redirect } from "next/navigation";
import { auth, isGithubAuthEnabled } from "@/auth";
import { AuthCard } from "@/components/auth/auth-card";

export default async function RegisterPage() {
  if (await auth()) redirect("/");
  return <AuthCard mode="register" isGithubEnabled={isGithubAuthEnabled} />;
}
