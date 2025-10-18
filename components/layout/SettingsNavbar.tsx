import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function SettingsNavbar() {
  return (
    <header className="border-b border-[rgba(167,139,250,0.2)] dark:bg-background bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-br from-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent">
              ReflectAI
            </span>
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
