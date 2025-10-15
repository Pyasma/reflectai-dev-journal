'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-2xl">
        <div className="bg-gray-100 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-t-md px-3 py-2.5 font-mono text-xs text-gray-500 dark:text-gray-400">
          reflectai-dev-journal
        </div>
        <div className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-b-md px-4 py-5 mb-8">
          <div className="font-mono text-5xl font-bold text-red-600 dark:text-red-400 mb-4 text-center">
            Error 404
          </div>
          <div className="font-mono text-sm text-gray-600 dark:text-gray-400 space-y-1.5 leading-relaxed">
            <div>{'// Route not found in application'}</div>
            <div>❌ The requested page does not exist</div>
            <div>📍 Check the URL or return to home</div>
          </div>
        </div>
        <div className="flex gap-2.5 justify-center flex-wrap">
          <button
            onClick={() => router.back()}
            className="bg-gray-200 dark:bg-neutral-700 border border-gray-400 dark:border-neutral-600 px-5 py-2.5 text-sm rounded text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors cursor-pointer"
          >
            ← Go Back
          </button>
          <Link
            href="/"
            className="bg-gray-200 dark:bg-neutral-700 border border-gray-400 dark:border-neutral-600 px-5 py-2.5 text-sm rounded text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors cursor-pointer"
          >
            🏠 Home
          </Link>
        </div>
      </div>
    </div>
  )
}
