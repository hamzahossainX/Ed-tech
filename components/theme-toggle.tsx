"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle color theme"}
      title={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle color theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative overflow-hidden border-black/10 bg-white/75 shadow-sm backdrop-blur-xl hover:bg-white dark:border-white/12 dark:bg-white/8 dark:hover:bg-white/14"
    >
      <Sun className="absolute size-[18px] rotate-0 scale-100 text-[#28583f] transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-[18px] rotate-90 scale-0 text-[#c8ff65] transition-all duration-300 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle color theme</span>
    </Button>
  );
}
