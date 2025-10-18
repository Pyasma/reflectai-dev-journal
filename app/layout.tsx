import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/layout/Footer";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Home,
  Settings,
  TrendingUp,
  PlusCircle,
  LogOut,
} from 'lucide-react';

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

  const handleSignOut = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/');
  };

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <header className="border-b border-[rgba(167,139,250,0.2)] dark:bg-background bg-background">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold bg-gradient-to-br from-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent">ReflectAI</span>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/statistics">
                  <Button variant="ghost" size="sm">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Statistics
                  </Button>
                </Link>
                <Link href="/dashboard/new-entry">
                  <Button variant="default" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Entry
                  </Button>
                </Link>
              </nav>

              {/* Right side: Theme Toggle + User Menu */}
              <div className="flex items-center gap-3">
                <ThemeToggle />
                {user && (
                  <>
                    <Link href="/settings">
                      <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                      </Button>
                    </Link>
                    <form action={handleSignOut}>
                      <Button variant="ghost" size="icon" type="submit">
                        <LogOut className="h-5 w-5" />
                      </Button>
                    </form>
                    {profile?.github_avatar_url && (
                      <Link href="/profile" className="cursor-pointer">
                        <img
                          src={profile.github_avatar_url}
                          alt={profile.github_username || 'User'}
                          className="h-8 w-8 rounded-full border-2 border-primary ring-2 ring-[rgba(167,139,250,0.3)] hover:ring-[rgba(167,139,250,0.5)] hover:opacity-80 transition-all duration-300"
                          title="View Profile"
                        />
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
