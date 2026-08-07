import { Header } from "@/components/Header";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen"><Header /><main className="mx-auto max-w-7xl px-6 py-10">{children}</main></div>;
}
