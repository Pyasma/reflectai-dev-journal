import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import {
  BookOpen,
  Home,
  Settings,
  TrendingUp,
  PlusCircle,
  LogOut,
  User,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';

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
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ReflectAI</span>
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
              <ThemeToggle />
              
              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    {profile?.github_avatar_url ? (
                      <img
                        src={profile.github_avatar_url}
                        alt={profile.github_username || 'User'}
                        className="h-10 w-10 rounded-full border-2 border-primary"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.github_username || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <form action={handleSignOut} className="w-full">
                      <button type="submit" className="flex w-full items-center cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
