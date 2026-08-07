import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c7156]",
  {
    variants: {
      variant: {
        default: "bg-[#17211b] text-white hover:-translate-y-0.5",
        accent: "bg-[#c8ff65] text-[#17211b] hover:brightness-95",
        outline: "border border-black/15 bg-transparent hover:bg-black/5",
      },
      size: { default: "h-11 px-5", sm: "h-9 px-4", lg: "h-13 px-7" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
