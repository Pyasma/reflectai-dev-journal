'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun, TreePine, Waves, Sunset } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Theme = 'light' | 'dark' | 'forest' | 'ocean' | 'sunset';

const VALID_THEMES: Theme[] = ['light', 'dark', 'forest', 'ocean', 'sunset'];

function isValidTheme(value: string | null): value is Theme {
  return value !== null && VALID_THEMES.includes(value as Theme);
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  // Remove all theme classes first
  root.classList.remove('dark', 'theme-forest', 'theme-ocean', 'theme-sunset');

  // Apply appropriate classes based on theme
  switch (theme) {
    case 'light':
      // No classes needed - uses :root defaults
      break;
    case 'dark':
      root.classList.add('dark');
      break;
    case 'forest':
      root.classList.add('dark', 'theme-forest');
      break;
    case 'ocean':
      root.classList.add('dark', 'theme-ocean');
      break;
    case 'sunset':
      root.classList.add('dark', 'theme-sunset');
      break;
  }
}

function getThemeIcon(theme: Theme, className: string) {
  switch (theme) {
    case 'light':
      return <Sun className={className} />;
    case 'dark':
      return <Moon className={className} />;
    case 'forest':
      return <TreePine className={className} />;
    case 'ocean':
      return <Waves className={className} />;
    case 'sunset':
      return <Sunset className={className} />;
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Read from localStorage
    const savedTheme = localStorage.getItem('theme');

    if (isValidTheme(savedTheme)) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Check system preference only when no valid saved theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme: Theme = isDark ? 'dark' : 'light';
      setTheme(systemTheme);
      applyTheme(systemTheme);
    }
  }, []);

  const handleThemeChange = (newTheme: string) => {
    if (!isValidTheme(newTheme)) return;

    setTheme(newTheme);
    applyTheme(newTheme);

    // Save to localStorage (with fallback for incognito mode)
    try {
      localStorage.setItem('theme', newTheme);
    } catch (_e) {
      // localStorage unavailable - theme still works but won't persist
      console.warn('localStorage unavailable, theme will not persist');
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <span className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Select theme">
          {getThemeIcon(theme, 'h-5 w-5')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
          <DropdownMenuRadioItem value="light" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="forest" className="flex items-center gap-2">
            <TreePine className="h-4 w-4" />
            <span>Forest</span>
            <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="ocean" className="flex items-center gap-2">
            <Waves className="h-4 w-4" />
            <span>Ocean</span>
            <span className="ml-auto h-2 w-2 rounded-full bg-sky-400" />
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="sunset" className="flex items-center gap-2">
            <Sunset className="h-4 w-4" />
            <span>Sunset</span>
            <span className="ml-auto h-2 w-2 rounded-full bg-orange-400" />
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
