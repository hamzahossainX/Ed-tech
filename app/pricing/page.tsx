import type { Metadata } from "next";
import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { PricingCards } from "@/components/pricing/pricing-cards";

export const metadata: Metadata = {
  title: "Pricing — LearnX",
  description:
    "Choose the plan that fits your learning journey. Free, Premium, or Diamond.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#060a07] text-white">
      <Header className="border-white/[.06] bg-[#060a07]/80 dark:border-white/[.06] dark:bg-[#060a07]/80">
        <Link
          href="/"
          className="flex min-h-10 items-center gap-2 text-xs font-bold text-white/50 hover:text-white sm:text-sm"
        >
          <ArrowLeft className="shrink-0" size={16} />
          Back to LearnX
        </Link>
      </Header>

      <div className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16 lg:px-8">
        {/* Hero */}
        <div className="text-center">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-4 py-2 text-xs font-bold text-white/60">
            <Shield className="size-3.5" />
            Simple, transparent pricing
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Invest in your{" "}
            <span className="bg-gradient-to-r from-[#C6F85E] to-emerald-400 bg-clip-text text-transparent">
              future
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/45 sm:text-lg">
            Unlock advanced AI models, unlimited roadmaps, and priority support.
            Choose the plan that accelerates your learning.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-14 sm:mt-16">
          <PricingCards />
        </div>

        {/* Trust Bar */}
        <div className="mt-16 text-center">
          <div className="mx-auto max-w-md rounded-2xl border border-white/8 bg-white/[.02] px-6 py-5">
            <p className="text-xs font-bold text-white/40">
              💳 Payments are processed via bKash & Nagad
            </p>
            <p className="mt-1.5 text-[11px] leading-5 text-white/25">
              All transactions are manually verified within 24 hours by our
              admin team. Your data is safe and secure.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
