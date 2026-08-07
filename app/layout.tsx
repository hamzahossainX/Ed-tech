import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LearnX — Your AI Learning Roadmap",
  description: "Turn verified learning into career-ready proof.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
