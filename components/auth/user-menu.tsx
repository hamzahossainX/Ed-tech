"use client";

import * as Avatar from "@radix-ui/react-avatar";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type UserMenuProps = { user: { name?: string | null; email?: string | null; image?: string | null } };

export function UserMenu({ user }: UserMenuProps) {
  const initials = user.name
    ?.split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LX";
  const avatarSeed = encodeURIComponent(
    user.email?.trim().toLowerCase() || user.name?.trim() || "learnx-user",
  );
  const avatarUrl = `https://api.dicebear.com/9.x/bottts/svg?seed=${avatarSeed}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group grid size-10 place-items-center rounded-full outline-none ring-offset-2 transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#3c7156] dark:ring-offset-[#0a0a0a]"
          aria-label="Open account menu"
        >
          <Avatar.Root className="grid size-10 place-items-center overflow-hidden rounded-full border border-black/10 bg-[#173f2c] text-xs font-black text-[#c8ff65] shadow-sm dark:border-white/15">
            <Avatar.Image
              src={avatarUrl}
              alt={`${user.name ?? "LearnX member"}'s robot avatar`}
              referrerPolicy="no-referrer"
              className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-12"
            />
            <Avatar.Fallback delayMs={300}>{initials}</Avatar.Fallback>
          </Avatar.Root>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <span className="block truncate normal-case tracking-normal text-[#17211b] dark:text-white">
            {user.name ?? "LearnX member"}
          </span>
          {user.email && (
            <span className="mt-0.5 block max-w-48 truncate text-[11px] font-medium normal-case tracking-normal text-black/40 dark:text-white/40">
              {user.email}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => signOut({ redirectTo: "/" })}
          className="text-red-600 focus:bg-red-50 dark:text-red-400 dark:focus:bg-red-950/30"
        >
          <LogOut size={16} />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
