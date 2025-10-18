import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/layout/Footer";
import { SimpleNavbar } from "@/components/layout/SimpleNavbar";
import { FullNavbar } from "@/components/layout/FullNavbar";
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

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

  // Get current pathname to determine which navbar to show
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('referer') || '';
  
  // Determine if we should show the simple navbar (theme toggle only)
  // Simple navbar for: landing page (/), settings page (/settings)
  // Full navbar for: dashboard, statistics, profile pages when authenticated
  const isLandingPage = pathname === '/' || pathname.endsWith('/');
  const isSettingsPage = pathname.includes('/settings');
  const showSimpleNavbar = !user || isLandingPage || isSettingsPage;

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        {showSimpleNavbar ? (
          <SimpleNavbar />
        ) : (
          <FullNavbar user={user} profile={profile} />
        )}
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
