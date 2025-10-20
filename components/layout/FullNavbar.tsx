'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { BookOpen, Home, Settings, TrendingUp, PlusCircle, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface FullNavbarProps {
  user: any;
  profile: { github_username?: string; github_avatar_url?: string } | null;
  handleSignOut: () => Promise<void>;
}

export function FullNavbar({ user, profile, handleSignOut }: FullNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on pathname change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobileMenuOpen]);

  // Close menu on window resize to desktop size
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="border-b border-[rgba(167,139,250,0.2)] dark:bg-background bg-background" ref={menuRef}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-br from-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent">ReflectAI</span>
          </Link>

          {/* Navigation Links - Desktop */}
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

          {/* Right side: Hamburger + Theme Toggle + User Menu */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button - Mobile Only */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

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

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-2 border-t border-[rgba(167,139,250,0.2)] pt-4 animate-fade-in-down">
            <div className="flex flex-col gap-2">
              <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                <Button 
                  variant={pathname === '/dashboard' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="w-full justify-start"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/statistics" onClick={() => setIsMobileMenuOpen(false)}>
                <Button 
                  variant={pathname === '/statistics' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="w-full justify-start"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Statistics
                </Button>
              </Link>
              <Link href="/dashboard/new-entry" onClick={() => setIsMobileMenuOpen(false)}>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full justify-start"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Entry
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
