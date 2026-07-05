import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "YouPass English — TOEIC Practice Platform",
  description:
    "Practice TOEIC and English skills with timed exams, instant scoring, review explanations, and a teacher-friendly question bank.",
  generator: "v0.app",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#4caf84",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased font-sans">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <TooltipProvider>{children}</TooltipProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
