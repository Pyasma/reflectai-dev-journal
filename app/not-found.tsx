'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NotFound() {
  const router = useRouter()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>404 - Page Not Found | reflectai-dev-journal</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #ffffff;
            color: #000000;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .container {
            width: 100%;
            max-width: 600px;
          }

          .terminal-header {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 6px 6px 0 0;
            padding: 10px 12px;
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            font-size: 12px;
            color: #6b7280;
          }

          .error-display {
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            font-size: 48px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 15px;
            text-align: center;
          }

          .error-box {
            background-color: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 0 0 6px 6px;
            padding: 20px 15px;
            margin-bottom: 30px;
          }

          .error-message {
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            font-size: 14px;
            color: #666666;
            line-height: 1.6;
          }

          .error-message div {
            margin-bottom: 5px;
          }

          .error-message div:last-child {
            margin-bottom: 0;
          }

          .button-group {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
          }

          .button {
            background-color: #e5e7eb;
            border: 1px solid #9ca3af;
            padding: 10px 20px;
            font-size: 14px;
            border-radius: 4px;
            cursor: pointer;
            font-family: ui-sans-serif, system-ui, sans-serif;
            text-decoration: none;
            color: #1f2937;
            display: inline-block;
            transition: background-color 0.2s;
          }

          .button:hover {
            background-color: #d1d5db;
          }

          @media (prefers-color-scheme: dark) {
            body {
              background-color: #1a1a1a;
              color: #e0e0e0;
            }

            .terminal-header {
              background-color: #2a2a2a;
              border-color: #444444;
              color: #9ca3af;
            }

            .error-display {
              color: #ff6b6b;
            }

            .error-box {
              background-color: #2a2a2a;
              border-color: #444444;
            }

            .error-message {
              color: #9ca3af;
            }

            .button {
              background-color: #555555;
              border-color: #666666;
              color: #e0e0e0;
            }

            .button:hover {
              background-color: #666666;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="terminal-header">reflectai-dev-journal</div>
          <div className="error-box">
            <div className="error-display">Error 404</div>
            <div className="error-message">
              <div>{'// Route not found in application'}</div>
              <div>❌ The requested page does not exist</div>
              <div>📍 Check the URL or return to home</div>
            </div>
          </div>
          <div className="button-group">
            <button
              onClick={() => router.back()}
              className="button"
            >
              ← Go Back
            </button>
            <Link href="/" className="button">
              🏠 Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
