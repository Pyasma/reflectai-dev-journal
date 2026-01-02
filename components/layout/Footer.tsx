import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-primary/10 mt-auto bg-secondary/50">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center justify-center gap-4">
          {/* Made by Compyle */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Made by</span>
            <Link
              href="https://compyle.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent hover:from-accent hover:to-primary transition-all duration-300"
            >
              Compyle
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
