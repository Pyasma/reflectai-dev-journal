import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  BookOpen,
  Home,
  Settings,
  TrendingUp,
  PlusCircle,
  LogOut,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Fetch user profile for avatar
  const { data: profile } = await supabase
    .from('users')
    .select('github_username, github_avatar_url')
    .eq('id', user.id)
    .single();

  const handleSignOut = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b border-[rgba(167,139,250,0.2)] dark:bg-card/50 bg-white/50 backdrop-blur-md">
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

            {/* User Menu */}
            <div className="flex items-center gap-3">
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">{children}</main>
      <Footer />
    </div>
  );
}
