"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const spring = { type: "spring", stiffness: 420, damping: 28 } as const;

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled
        aria-label="Loading color theme"
        className="rounded-full border border-black/6 bg-black/[.025] dark:border-white/8 dark:bg-white/5"
      >
        <span className="size-[18px] animate-pulse rounded-full bg-black/10 dark:bg-white/15" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative rounded-full border border-black/6 bg-black/[.025] text-[#28583f] shadow-sm shadow-black/5 backdrop-blur-xl transition-colors hover:bg-black/[.06] dark:border-white/10 dark:bg-white/[.06] dark:text-[#c8ff65] dark:shadow-black/30 dark:hover:bg-white/[.11]"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: -75, scale: 0.35, y: 6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1, y: 0 }}
            exit={{ opacity: 0, rotate: 75, scale: 0.35, y: 6 }}
            transition={spring}
            className="absolute grid place-items-center"
          >
            <Moon className="size-[18px]" strokeWidth={2.2} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: 90, scale: 0.35 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.35 }}
            transition={spring}
            className="absolute grid place-items-center"
          >
            <Sun className="size-[18px]" strokeWidth={2.2} />
          </motion.span>
        )}
      </AnimatePresence>
      <span className="sr-only">Toggle color theme</span>
    </Button>
  );
}
