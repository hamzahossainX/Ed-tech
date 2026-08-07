import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} className={cn("flex h-12 w-full rounded-xl border border-black/10 bg-white/75 px-4 text-sm text-[#17211b] shadow-sm outline-none transition placeholder:text-black/30 focus:border-[#3c7156] focus:ring-4 focus:ring-[#3c7156]/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[.06] dark:text-white dark:placeholder:text-white/30 dark:focus:border-[#c8ff65]/60 dark:focus:ring-[#c8ff65]/10", className)} {...props} />;
}

export { Input };
