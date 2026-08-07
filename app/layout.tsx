import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "LearnX — Your AI Learning Roadmap",
  description: "Turn verified learning into career-ready proof.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#f8f9fa] text-[#17211b] antialiased dark:bg-[#0a0a0a] dark:text-[#f2f7f3]">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0a0a0a]">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
