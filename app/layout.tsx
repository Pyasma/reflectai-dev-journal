import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "ReflectAI - Developer Journal",
  description: "AI-powered development journal that automatically logs and reflects on your coding sessions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <header className="border-b border-[rgba(167,139,250,0.15)] dark:border-[rgba(167,139,250,0.2)] px-6 py-4 backdrop-blur-sm bg-card/50">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-br from-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent">ReflectAI</h1>
            <ThemeToggle />
          </div>
        </header>
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
