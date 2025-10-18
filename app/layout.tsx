import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/layout/Footer";
import { NavbarWrapper } from "@/components/layout/NavbarWrapper";
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: "ReflectAI - Developer Journal",
  description: "AI-powered development journal that automatically logs and reflects on your coding sessions",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user profile for avatar if logged in
  let profile = null;
  if (user) {
    const { data: profileData } = await supabase
      .from('users')
      .select('github_username, github_avatar_url')
      .eq('id', user.id)
      .single();
    profile = profileData;
  }

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <NavbarWrapper user={user} profile={profile} />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
