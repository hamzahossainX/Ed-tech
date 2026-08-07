"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

function DropdownMenuContent({ className, sideOffset = 8, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return <DropdownMenuPortal><DropdownMenuPrimitive.Content sideOffset={sideOffset} className={cn("z-[70] min-w-56 overflow-hidden rounded-2xl border border-black/10 bg-white/95 p-1.5 text-[#17211b] shadow-2xl backdrop-blur-xl data-[state=closed]:animate-out data-[state=open]:animate-in dark:border-white/10 dark:bg-[#111512]/95 dark:text-white", className)} {...props} /></DropdownMenuPortal>;
}

function DropdownMenuItem({ className, inset, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & { inset?: boolean }) {
  return <DropdownMenuPrimitive.Item className={cn("relative flex min-h-10 cursor-default select-none items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold outline-none transition-colors focus:bg-black/5 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-white/10", inset && "pl-8", className)} {...props} />;
}

function DropdownMenuLabel({ className, inset, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }) {
  return <DropdownMenuPrimitive.Label className={cn("px-3 py-2 text-xs font-black uppercase tracking-[.12em] text-black/40 dark:text-white/40", inset && "pl-8", className)} {...props} />;
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-black/8 dark:bg-white/8", className)} {...props} />;
}

function DropdownMenuCheckboxItem({ className, children, checked, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return <DropdownMenuPrimitive.CheckboxItem className={cn("relative flex min-h-10 cursor-default select-none items-center rounded-xl py-2 pl-8 pr-3 text-sm outline-none focus:bg-black/5 dark:focus:bg-white/10", className)} checked={checked} {...props}><span className="absolute left-2.5 grid size-4 place-items-center"><DropdownMenuPrimitive.ItemIndicator><Check size={14} /></DropdownMenuPrimitive.ItemIndicator></span>{children}</DropdownMenuPrimitive.CheckboxItem>;
}

function DropdownMenuSubTrigger({ className, inset, children, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & { inset?: boolean }) {
  return <DropdownMenuPrimitive.SubTrigger className={cn("flex min-h-10 cursor-default select-none items-center rounded-xl px-3 py-2 text-sm outline-none focus:bg-black/5 dark:focus:bg-white/10", inset && "pl-8", className)} {...props}>{children}<ChevronRight className="ml-auto size-4" /></DropdownMenuPrimitive.SubTrigger>;
}

const DropdownMenuSubContent = DropdownMenuContent;
const DropdownMenuRadioItem = DropdownMenuPrimitive.RadioItem;

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem };
