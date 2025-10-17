import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
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
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
