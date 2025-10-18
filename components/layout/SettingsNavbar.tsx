import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function SettingsNavbar() {
  return (
    <header className="border-b border-[rgba(167,139,250,0.2)] dark:bg-background bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-end">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
