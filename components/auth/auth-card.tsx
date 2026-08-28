"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Github, LoaderCircle, ShieldCheck, Sparkles, X } from "lucide-react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema, passwordChecks, registrationSchema, type LoginInput, type RegistrationInput } from "@/lib/auth-validation";

type AuthCardProps = {
  mode: "login" | "register";
  initialError?: string;
  initialNotice?: string;
};

export function AuthCard({ mode, initialError, initialNotice }: AuthCardProps) {
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | undefined>(initialError);
  const [formNotice, setFormNotice] = useState<string | undefined>(initialNotice);
  const router = useRouter();
  const isRegister = mode === "register";
  const loginForm = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const registerForm = useForm<RegistrationInput>({ resolver: zodResolver(registrationSchema), defaultValues: { firstName: "", lastName: "", email: "", password: "" } });
  const password = registerForm.watch("password");
  const passedChecks = passwordChecks.filter((check) => check.test(password)).length;

  async function continueWithGitHub() {
    setPending(true);
    setFormError(undefined);
    setFormNotice(undefined);

    try {
      await signIn("github", { redirectTo: "/" });
    } catch {
      setFormError("GitHub sign-in is temporarily unavailable. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function login(values: LoginInput) {
    setPending(true);
    setFormError(undefined);
    setFormNotice(undefined);

    try {
      const result = await signIn("credentials", { ...values, redirect: false });
      if (!result?.ok) {
        setFormError(
          result?.error === "CredentialsSignin"
            ? "Email or password is incorrect."
            : "Sign-in is temporarily unavailable. Please try again shortly.",
        );
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setFormError("Sign-in is temporarily unavailable. Please try again shortly.");
    } finally {
      setPending(false);
    }
  }

  async function register(values: RegistrationInput) {
    setPending(true);
    setFormError(undefined);
    setFormNotice(undefined);

    try {
      const result = await registerUser(values);
      if (!result.success) {
        setFormError(result.message);
        if (result.fields) {
          for (const [field, message] of Object.entries(result.fields)) {
            registerForm.setError(field as keyof RegistrationInput, { message });
          }
        }
        return;
      }

      const loginResult = await signIn("credentials", {
        email: values.email.trim().toLowerCase(),
        password: values.password,
        redirect: false,
      });

      if (!loginResult?.ok) {
        setFormError("Your account was created. Please continue from the sign-in page.");
        router.replace("/login?registered=1");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setFormError("Account creation is temporarily unavailable. Please try again shortly.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(200,255,101,.2),transparent_28rem)] dark:bg-[radial-gradient(circle_at_50%_20%,rgba(200,255,101,.1),transparent_30rem)]" />
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 140, damping: 20 }} className={`relative w-full overflow-hidden rounded-3xl border border-black/8 bg-white/10 p-5 shadow-[0_24px_80px_rgba(23,33,27,.13)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/50 dark:shadow-[0_24px_80px_rgba(0,0,0,.45)] sm:p-6 ${isRegister ? "max-w-lg" : "max-w-md"}`}>
        <div className="absolute -right-16 -top-16 size-44 rounded-full bg-[#c8ff65]/15 blur-3xl" />
        <div className="relative">
          <div className="mb-3 grid size-11 place-items-center rounded-xl bg-[#173f2c] text-[#c8ff65] shadow-lg shadow-[#173f2c]/15"><Sparkles size={20} /></div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#3c7156] dark:text-[#c8ff65]">LearnX identity</p>
          <h1 className="mt-2 text-2xl font-black tracking-[-.04em] sm:text-3xl">{isRegister ? "Start forging your path." : "Welcome back."}</h1>
          <p className="mt-1.5 text-xs leading-5 text-black/50 dark:text-white/55">{isRegister ? "Create your LearnX profile with email or GitHub." : "Sign in to continue your learning journey."}</p>
          {isRegister ? <Form {...registerForm}><form onSubmit={registerForm.handleSubmit(register)} className="mt-4 space-y-3"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"><FormField control={registerForm.control} name="firstName" render={({ field }) => <FormItem><FormLabel>First name</FormLabel><FormControl><Input className="h-10" autoComplete="given-name" placeholder="Ada" {...field} /></FormControl><FormMessage /></FormItem>} /><FormField control={registerForm.control} name="lastName" render={({ field }) => <FormItem><FormLabel>Last name</FormLabel><FormControl><Input className="h-10" autoComplete="family-name" placeholder="Lovelace" {...field} /></FormControl><FormMessage /></FormItem>} /></div><FormField control={registerForm.control} name="email" render={({ field }) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input className="h-10" type="email" autoComplete="email" placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>} /><FormField control={registerForm.control} name="password" render={({ field }) => <FormItem><FormLabel>Password</FormLabel><FormControl><Input className="h-10" type="password" autoComplete="new-password" placeholder="Create a strong password" {...field} /></FormControl><FormMessage /></FormItem>} /><div className="space-y-1.5"><div className="grid grid-cols-4 gap-1.5">{passwordChecks.map((check) => <span key={check.label} className={`h-1 rounded-full transition-colors ${check.test(password) ? "bg-[#73a52e] dark:bg-[#c8ff65]" : "bg-black/8 dark:bg-white/10"}`} />)}</div><div className="grid grid-cols-2 gap-x-3 gap-y-0.5">{passwordChecks.map((check) => { const passed = check.test(password); return <span key={check.label} className={`flex items-center gap-1 text-[9px] font-semibold ${passed ? "text-[#3c7156] dark:text-[#c8ff65]" : "text-black/35 dark:text-white/35"}`}>{passed ? <Check size={10} /> : <X size={10} />}{check.label}</span>; })}</div><p className="text-right text-[9px] font-black uppercase tracking-wider text-black/35 dark:text-white/35">{passedChecks < 2 ? "Weak" : passedChecks < 4 ? "Good" : "Strong"}</p></div>{formError && <p role="alert" className="rounded-xl bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300">{formError}</p>}{formNotice && <p role="status" className="rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">{formNotice}</p>}<Button type="submit" disabled={pending} className="h-11 w-full rounded-xl">{pending ? <LoaderCircle className="animate-spin" /> : null}{pending ? "Creating account…" : "Create account"}</Button></form></Form> : <Form {...loginForm}><form onSubmit={loginForm.handleSubmit(login)} className="mt-4 space-y-3"><FormField control={loginForm.control} name="email" render={({ field }) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input className="h-10" type="email" autoComplete="email" placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>} /><FormField control={loginForm.control} name="password" render={({ field }) => <FormItem><FormLabel>Password</FormLabel><FormControl><Input className="h-10" type="password" autoComplete="current-password" placeholder="Your password" {...field} /></FormControl><FormMessage /></FormItem>} />{formError && <p role="alert" className="rounded-xl bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300">{formError}</p>}{formNotice && <p role="status" className="rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">{formNotice}</p>}<Button type="submit" disabled={pending} className="h-11 w-full rounded-xl">{pending ? <LoaderCircle className="animate-spin" /> : null}{pending ? "Signing in…" : "Sign in"}</Button></form></Form>}
          <div className="flex items-center gap-3 py-4"><span className="h-px flex-1 bg-black/8 dark:bg-white/10" /><span className="text-[10px] font-black uppercase tracking-[.2em] text-black/30 dark:text-white/30">or</span><span className="h-px flex-1 bg-black/8 dark:bg-white/10" /></div>
          <button type="button" disabled={pending} onClick={continueWithGitHub} className="flex h-11 w-full items-center justify-center gap-3 rounded-xl bg-[#17211b] px-5 text-sm font-black text-white shadow-lg transition duration-200 hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(23,63,44,0.28)] disabled:cursor-wait disabled:opacity-65 dark:bg-white dark:text-[#111512] dark:hover:shadow-[0_0_15px_rgba(198,248,94,0.3)]">
            {pending ? <LoaderCircle className="size-5 animate-spin" /> : <Github className="size-5" />}
            {pending ? "Connecting…" : "Continue with GitHub"}
          </button>
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-black/6 bg-black/[.025] p-2.5 text-[10px] leading-4 text-black/45 dark:border-white/8 dark:bg-white/[.035] dark:text-white/45"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#3c7156] dark:text-[#c8ff65]" />GitHub verifies your identity. LearnX never stores your GitHub password.</div>
          <p className="mt-3 text-center text-xs text-black/45 dark:text-white/45">{isRegister ? "Already have an account?" : "New to LearnX?"} <Link href={isRegister ? "/login" : "/register"} className="font-black text-[#28583f] hover:underline dark:text-[#c8ff65]">{isRegister ? "Sign in" : "Create one"}</Link></p>
        </div>
      </motion.section>
    </main>
  );
}
