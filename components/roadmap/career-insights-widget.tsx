"use client";

import { motion } from "framer-motion";
import { BadgeDollarSign, BriefcaseBusiness, TrendingUp } from "lucide-react";
import type { CareerInsights } from "@/lib/career-insights";

type Props = {
  insights: CareerInsights;
};

export function CareerInsightsWidget({ insights }: Props) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      aria-label="AI-generated career insights"
      className="border-b border-[#3c7156]/15 bg-gradient-to-r from-[#edf8df] via-[#f7fbed] to-[#eef8e2] px-4 py-5 dark:border-[#c8ff65]/15 dark:from-[#15251b] dark:via-[#111a14] dark:to-[#16251b] sm:px-6 md:px-8 lg:px-10"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#3c7156] dark:text-[#c8ff65]">
            Career snapshot
          </p>
          <p className="mt-1 text-xs text-black/45 dark:text-white/45">
            AI estimate · Salary and demand vary by location and experience
          </p>
        </div>
        <span className="rounded-full border border-[#3c7156]/15 bg-white/65 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#28583f] dark:border-[#c8ff65]/15 dark:bg-white/5 dark:text-[#c8ff65]">
          Market value
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.4fr]">
        <div className="rounded-2xl border border-black/5 bg-white/75 p-4 shadow-sm backdrop-blur-sm dark:border-white/8 dark:bg-white/5">
          <div className="flex items-center gap-2 text-xs font-bold text-black/45 dark:text-white/45">
            <TrendingUp className="size-4 text-[#3c7156] dark:text-[#c8ff65]" aria-hidden="true" />
            Market demand
          </div>
          <p className="mt-2 text-base font-black text-[#17211b] dark:text-white">
            {insights.marketDemand}
          </p>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white/75 p-4 shadow-sm backdrop-blur-sm dark:border-white/8 dark:bg-white/5">
          <div className="flex items-center gap-2 text-xs font-bold text-black/45 dark:text-white/45">
            <BadgeDollarSign className="size-4 text-[#3c7156] dark:text-[#c8ff65]" aria-hidden="true" />
            Entry salary
          </div>
          <p className="mt-2 text-base font-black text-[#17211b] dark:text-white">
            {insights.entrySalary}
          </p>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white/75 p-4 shadow-sm backdrop-blur-sm dark:border-white/8 dark:bg-white/5">
          <div className="flex items-center gap-2 text-xs font-bold text-black/45 dark:text-white/45">
            <BriefcaseBusiness className="size-4 text-[#3c7156] dark:text-[#c8ff65]" aria-hidden="true" />
            Top roles
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {insights.topRoles.map((role, index) => (
              <span
                key={`${index}-${role}`}
                className="rounded-full bg-[#173f2c] px-3 py-1.5 text-xs font-bold text-white dark:bg-[#c8ff65] dark:text-[#17211b]"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
