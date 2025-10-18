'use client';

import { usePathname } from 'next/navigation';
import { SimpleNavbar } from './SimpleNavbar';
import { FullNavbar } from './FullNavbar';

interface NavbarWrapperProps {
  user: any;
  profile: {
    github_username?: string;
    github_avatar_url?: string;
  } | null;
}

export function NavbarWrapper({ user, profile }: NavbarWrapperProps) {
  const pathname = usePathname();

  // Determine if we should show the simple navbar (theme toggle only)
  // Simple navbar for: landing page (/), settings page (/settings)
  // Full navbar for: dashboard, statistics, profile pages when authenticated
  const isLandingPage = pathname === '/';
  const isSettingsPage = pathname === '/settings';
  const showSimpleNavbar = !user || isLandingPage || isSettingsPage;

  if (showSimpleNavbar) {
    return <SimpleNavbar />;
  }

  return <FullNavbar user={user} profile={profile} />;
}
