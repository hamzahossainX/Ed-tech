"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-black/15 shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#a9e950] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#3c7156] dark:bg-white/15 dark:data-[state=checked]:bg-[#a9e950]",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-5 translate-x-0 rounded-full bg-white shadow-md transition-transform data-[state=checked]:translate-x-5 dark:data-[state=checked]:bg-[#17211b]"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
