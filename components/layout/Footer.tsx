import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-[rgba(167,139,250,0.2)] dark:border-[rgba(167,139,250,0.2)] mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Made by Compyle */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made by</span>
            <Link
              href="https://compyle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold bg-gradient-to-br from-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent hover:from-[#C084FC] hover:to-[#A78BFA] transition-all duration-300"
            >
              Compyle
            </Link>
          </div>

          {/* Footer Links */}
          <div className="flex items-center gap-4 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
            <div className="w-px h-4 bg-[rgba(167,139,250,0.2)]" />
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Terms
            </Link>
            <div className="w-px h-4 bg-[rgba(167,139,250,0.2)]" />
            <Link href="/support" className="text-muted-foreground hover:text-primary transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
