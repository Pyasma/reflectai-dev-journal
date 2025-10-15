'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Read from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Check system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = isDark ? 'dark' : 'light';
      setTheme(systemTheme);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Save to localStorage (with fallback for incognito mode)
    try {
      localStorage.setItem('theme', newTheme);
    } catch (e) {
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
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <Sun
        className={`h-5 w-5 transition-all ${
          theme === 'dark'
            ? 'rotate-0 scale-100'
            : 'rotate-90 scale-0 absolute'
        }`}
      />
      <Moon
        className={`h-5 w-5 transition-all ${
          theme === 'light'
            ? 'rotate-0 scale-100'
            : 'rotate-90 scale-0 absolute'
        }`}
      />
    </Button>
  );
}
