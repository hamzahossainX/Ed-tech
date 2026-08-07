"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn, UserPlus } from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";

type AuthNavProps = { user?: { name?: string | null; email?: string | null; image?: string | null } };

export function AuthNav({ user }: AuthNavProps) {
  if (user) return <UserMenu user={user} />;
  return <div className="flex items-center gap-1.5 sm:gap-2"><motion.div whileHover={{ y: -1 }} whileTap={{ scale: .98 }}><Link href="/login" className="flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-black text-[#28583f] transition hover:bg-black/5 dark:text-white/75 dark:hover:bg-white/8 sm:px-4"><LogIn className="hidden sm:block" size={15} />Sign in</Link></motion.div><motion.div whileHover={{ y: -1, scale: 1.02 }} whileTap={{ scale: .98 }}><Link href="/register" className="flex min-h-10 items-center gap-2 rounded-full bg-[#173f2c] px-3 text-sm font-black text-white shadow-sm transition hover:bg-[#21573d] dark:bg-[#c8ff65] dark:text-[#17211b] dark:hover:bg-[#d5ff86] sm:px-4"><UserPlus className="hidden sm:block" size={15} />Sign up</Link></motion.div></div>;
}
