import Link from "next/link";
import { Hammer } from "lucide-react";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen"><header className="border-b border-black/8 bg-white/70 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"><Link href="/" className="flex items-center gap-2 font-black"><span className="grid size-8 place-items-center rounded-full bg-[#173f2c] text-[#c8ff65]"><Hammer size={16} /></span>LearnX</Link></div></header><main className="mx-auto max-w-7xl px-6 py-10">{children}</main></div>;
}
