import { BookOpen, Home, Settings, TrendingUp, PlusCircle, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface FullNavbarProps {
  user: any;
  profile: { github_username?: string; github_avatar_url?: string } | null;
  handleSignOut: () => Promise<void>;
}

export function FullNavbar({ user, profile, handleSignOut }: FullNavbarProps) {
  return (
    <header className="border-b border-primary/20 dark:bg-background bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">ReflectAI</span>
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
                      className="h-8 w-8 rounded-full border-2 border-primary ring-2 ring-primary/30 hover:ring-primary/50 hover:opacity-80 transition-all duration-300"
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
  );
}
