"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Crown,
  Diamond,
  Sparkles,
  Zap,
} from "lucide-react";
import { PaymentFormDialog } from "@/components/pricing/payment-form-dialog";

type Tier = {
  name: string;
  tagline: string;
  price: string;
  period: string;
  icon: React.ReactNode;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  gradient: string;
  buttonText: string;
  buttonStyle: string;
  cardBorder: string;
  cardBg: string;
  iconWrapperBg: string;
  packageType?: "Premium" | "Diamond";
};

const tiers: Tier[] = [
  {
    name: "Normal",
    tagline: "Start learning for free",
    price: "Free",
    period: "forever",
    icon: <Zap className="size-6" />,
    features: [
      "5 AI roadmaps per day",
      "3 social shares per day",
      "Standard AI models",
      "Milestone tracking",
      "Certificate of completion",
      "Community support",
    ],
    gradient: "from-emerald-600/20 to-teal-600/10",
    buttonText: "Current Plan",
    buttonStyle:
      "border border-white/15 bg-white/5 text-white/50 cursor-default",
    cardBorder: "border-white/8",
    cardBg: "bg-white/[.02]",
    iconWrapperBg: "bg-emerald-500/10 text-emerald-400",
  },
  {
    name: "Premium",
    tagline: "Supercharge your learning",
    price: "৳499",
    period: "/month",
    icon: <Crown className="size-6" />,
    features: [
      "20 AI roadmaps per day",
      "Unlimited social shares",
      "Advanced AI models",
      "Deep Dive + Interview Prep",
      "ELI5 explanations",
      "AI Mentor chat",
      "Priority generation queue",
    ],
    highlighted: true,
    badge: "Most Popular",
    gradient: "from-violet-600/30 to-indigo-600/15",
    buttonText: "Upgrade to Premium",
    buttonStyle:
      "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_8px_32px_rgba(124,58,237,.3)]",
    cardBorder: "border-violet-500/25",
    cardBg: "bg-gradient-to-b from-violet-950/40 to-transparent",
    iconWrapperBg: "bg-violet-500/15 text-violet-400",
    packageType: "Premium",
  },
  {
    name: "Diamond",
    tagline: "Unlimited everything",
    price: "৳999",
    period: "/month",
    icon: <Diamond className="size-6" />,
    features: [
      "Unlimited AI roadmaps",
      "Unlimited social shares",
      "All Premium features",
      "Priority support",
      "Early access to new features",
      "Custom roadmap themes",
      "Team collaboration (soon)",
      "API access (soon)",
    ],
    badge: "Best Value",
    gradient: "from-amber-500/25 to-orange-600/10",
    buttonText: "Go Diamond",
    buttonStyle:
      "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-[0_8px_32px_rgba(245,158,11,.25)]",
    cardBorder: "border-amber-500/20",
    cardBg: "bg-gradient-to-b from-amber-950/30 to-transparent",
    iconWrapperBg: "bg-amber-500/15 text-amber-400",
    packageType: "Diamond",
  },
];

export function PricingCards() {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<
    "Premium" | "Diamond"
  >("Premium");

  function handleUpgrade(packageType: "Premium" | "Diamond") {
    setSelectedPackage(packageType);
    setPaymentOpen(true);
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3 md:gap-5 lg:gap-8">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={`relative flex flex-col overflow-hidden rounded-3xl border ${tier.cardBorder} ${tier.cardBg} p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/15 hover:-translate-y-1 lg:p-8 ${
              tier.highlighted
                ? "shadow-[0_20px_60px_rgba(124,58,237,.15)] ring-1 ring-violet-500/20"
                : ""
            }`}
          >
            {/* Badge */}
            {tier.badge && (
              <div className="absolute right-5 top-5">
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] ${
                    tier.name === "Diamond"
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-violet-500/15 text-violet-400"
                  }`}
                >
                  {tier.badge}
                </span>
              </div>
            )}

            {/* Header */}
            <div className={`grid size-14 place-items-center rounded-2xl ${tier.iconWrapperBg}`}>
              {tier.icon}
            </div>
            <h3 className="mt-4 text-xl font-black tracking-tight text-white">
              {tier.name}
            </h3>
            <p className="mt-1 text-sm text-white/45">{tier.tagline}</p>

            {/* Price */}
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-black tracking-tight text-white">
                {tier.price}
              </span>
              <span className="text-sm font-medium text-white/40">
                {tier.period}
              </span>
            </div>

            {/* Divider */}
            <div className="my-6 h-px bg-white/8" />

            {/* Features */}
            <ul className="flex-1 space-y-3">
              {tier.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-sm text-white/65"
                >
                  <Check
                    className={`mt-0.5 size-4 shrink-0 ${
                      tier.name === "Diamond"
                        ? "text-amber-400"
                        : tier.name === "Premium"
                          ? "text-violet-400"
                          : "text-emerald-400"
                    }`}
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <button
              type="button"
              disabled={!tier.packageType}
              onClick={() =>
                tier.packageType && handleUpgrade(tier.packageType)
              }
              className={`mt-8 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-black transition-all ${tier.buttonStyle}`}
            >
              {tier.name === "Normal" ? (
                tier.buttonText
              ) : (
                <>
                  <Sparkles className="size-4" />
                  {tier.buttonText}
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <PaymentFormDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        packageType={selectedPackage}
      />
    </>
  );
}
