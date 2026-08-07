import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthCard } from "@/components/auth/auth-card";

export default async function LoginPage() {
  if (await auth()) redirect("/");
  return <AuthCard mode="login" />;
}
