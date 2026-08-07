import type { ReactNode } from "react";
import Link from "next/link";
import { Hammer, LogIn } from "lucide-react";
import { auth } from "@/auth";
import { UserMenu } from "@/components/auth/user-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeaderProps = {
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
};

export async function Header({ children, className, contentClassName }: HeaderProps) {
  const session = await auth();

  return (
    <header
      className={cn(
        "relative z-50 border-b border-black/[.06] bg-[#f8f9fa]/75 backdrop-blur-xl dark:border-white/[.08] dark:bg-[#0a0a0a]/75",
        className,
      )}
    >
      <div className={cn("mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-10", contentClassName)}>
        <Link href="/" className="flex min-h-10 items-center gap-2 text-lg font-black tracking-tight">
          <span className="grid size-9 place-items-center rounded-full bg-[#173f2c] text-[#c8ff65] ring-1 ring-black/5 dark:ring-white/10">
            <Hammer size={18} />
          </span>
          LearnX
        </Link>
        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
          {children}
          {session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <Button asChild variant="outline" className="h-10 border-black/10 bg-white/55 px-3 shadow-sm backdrop-blur hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 sm:px-4">
              <Link href="/login"><LogIn className="size-4" />Sign In</Link>
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
