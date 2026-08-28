import { LandingExperience } from "@/components/landing/landing-experience";
import { Header } from "@/components/Header";

// Route-segment configuration is inherited by Server Actions invoked here.
// Exporting this from a `"use server"` module would be invalid in Next.js.
export const maxDuration = 60;

export default function HomePage() {
  return <><Header className="border-b-0 bg-transparent dark:bg-transparent" contentClassName="py-5 sm:py-7"><span className="hidden rounded-full border border-[#173f2c]/15 bg-white/60 px-4 py-2 text-xs font-bold text-[#173f2c] backdrop-blur dark:border-white/10 dark:bg-white/8 dark:text-white/75 lg:inline-flex">AI-powered learning</span></Header><LandingExperience /></>;
}
