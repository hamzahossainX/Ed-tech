"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

function DialogContent({ className, overlayClassName, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content> & { overlayClassName?: string }) {
  return <DialogPrimitive.Portal><DialogPrimitive.Overlay className={cn("fixed inset-0 z-50 bg-[#17211b]/65 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in", overlayClassName)} /><DialogPrimitive.Content className={cn("fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-black/10 bg-[#fffefa] p-7 shadow-2xl outline-none dark:border-white/10 dark:bg-[#111512] dark:text-white md:p-9", className)} {...props}>{children}<DialogPrimitive.Close className="absolute right-5 top-5 grid size-9 place-items-center rounded-full bg-black/5 text-black/45 transition hover:bg-black/10 hover:text-black dark:bg-white/8 dark:text-white/55 dark:hover:bg-white/12 dark:hover:text-white" aria-label="Close"><X size={17} /></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>;
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("flex flex-col gap-2", className)} {...props} />; }
function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) { return <DialogPrimitive.Title className={cn("text-3xl font-black tracking-[-.04em]", className)} {...props} />; }
function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) { return <DialogPrimitive.Description className={cn("text-sm leading-6 text-black/50 dark:text-white/55", className)} {...props} />; }

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger };
