'use client';
import { usePathname } from 'next/navigation';
import { SimpleNavbar } from './SimpleNavbar';
import { SettingsNavbar } from './SettingsNavbar';
import { FullNavbar } from './FullNavbar';

interface NavbarWrapperProps {
  user: any;
  profile: { github_username?: string; github_avatar_url?: string } | null;
  handleSignOut: () => Promise<void>;
}

export function NavbarWrapper({ user, profile, handleSignOut }: NavbarWrapperProps) {
  const pathname = usePathname();

  // Landing page: Logo + Theme toggle
  if (pathname === '/') {
    return <SimpleNavbar />;
  }

  // Settings page: Only Theme toggle
  if (pathname === '/settings') {
    return <SettingsNavbar />;
  }

  // All other pages: Full navbar with navigation and user menu
  return <FullNavbar user={user} profile={profile} handleSignOut={handleSignOut} />;
}
