'use client'
import Link from 'next/navigation'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error('Global error caught:', error)

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-5">
        <div className="w-full max-w-2xl">
          <div className="bg-gray-100 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-t-md px-3 py-2.5 font-mono text-xs text-gray-500 dark:text-gray-400">
            reflectai-dev-journal
          </div>
          <div className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-b-md px-4 py-5 mb-8">
            <div className="font-mono text-5xl font-bold text-red-600 dark:text-red-400 mb-4 text-center">
              Error 500
            </div>
            <div className="font-mono text-sm text-gray-600 dark:text-gray-400 space-y-1.5 leading-relaxed">
              <div>// Application error encountered</div>
              <div>❌ Something went wrong on our end</div>
              <div>🔄 Try refreshing or return to home</div>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-3 mt-4 max-h-[200px] overflow-y-auto">
                <div className="font-mono text-xs font-semibold mb-2">
                  Error Details:
                </div>
                <div className="text-red-700 dark:text-red-300 text-sm mb-2">
                  {error.message || 'An unexpected error occurred'}
                </div>
                {error.digest && (
                  <div className="text-xs text-red-600 dark:text-red-400 mb-2">
                    Digest: {error.digest}
                  </div>
                )}
                {error.stack && (
                  <pre className="text-xs text-red-800 dark:text-red-200 whitespace-pre-wrap break-words font-mono">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2.5 justify-center flex-wrap">
            {reset && (
              <button
                onClick={() => reset()}
                className="bg-gray-200 dark:bg-neutral-700 border border-gray-400 dark:border-neutral-600 px-5 py-2.5 text-sm rounded text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors cursor-pointer"
              >
                ↻ Try Again
              </button>
            )}
            <Link
              href="/"
              className="bg-gray-200 dark:bg-neutral-700 border border-gray-400 dark:border-neutral-600 px-5 py-2.5 text-sm rounded text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors cursor-pointer"
            >
              🏠 Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
