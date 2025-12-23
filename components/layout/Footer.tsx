import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-primary/10 mt-auto bg-gray-50 dark:bg-[#0F0A08]">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center justify-center gap-4">
          {/* Made by Compyle */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 dark:text-gray-500">Made by</span>
            <Link
              href="https://compyle.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold bg-gradient-to-br from-[#F97316] to-[#EAB308] bg-clip-text text-transparent hover:from-[#EAB308] hover:to-[#F97316] transition-all duration-300"
            >
              Compyle
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
