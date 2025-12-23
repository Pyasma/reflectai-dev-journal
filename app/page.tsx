'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { Github, AlertCircle } from 'lucide-react';

function LandingPageContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOAuthError, setShowOAuthError] = useState(false);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);

  useEffect(() => {
    // Check for auth error from callback
    const errorParam = searchParams.get('error');
    if (errorParam === 'auth_failed') {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  useEffect(() => {
    // Check for code parameter on homepage (indicates GitHub redirected to wrong URL)
    const codeParam = searchParams.get('code');
    if (codeParam) {
      // Check if user is already authenticated
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        // Only show modal if not authenticated
        if (!session) {
          setDetectedCode(codeParam);
          setShowOAuthError(true);
        }
      });
    }
  }, [searchParams]);

  const handleCloseOAuthError = () => {
    setShowOAuthError(false);
    // Clean up URL by removing code parameter
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'read:user repo',
        },
      });

      if (signInError) {
        setError('Failed to initiate GitHub login. Please try again.');
        setIsLoading(false);
      }
    } catch (_err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-gray-50 via-orange-50/30 to-gray-50 dark:from-[#0F0A08] dark:via-[#1A0F08] dark:to-[#0F0A08] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 ai-grid-bg pointer-events-none opacity-30 dark:opacity-100" />
      <div className="absolute top-[10%] right-[15%] w-[500px] h-[500px] floating-orb opacity-30 dark:opacity-60 pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] floating-orb opacity-20 dark:opacity-40 pointer-events-none" />

      {/* OAuth Misconfiguration Modal */}
      <Dialog open={showOAuthError} onOpenChange={(open) => {
        if (!open) handleCloseOAuthError();
      }}>
        <DialogContent className="max-w-2xl animate-scale-in-center">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-6 w-6 text-destructive animate-pulse" />
              <DialogTitle className="text-xl">GitHub OAuth Misconfiguration Detected</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              GitHub is redirecting to the wrong URL. Your OAuth App&apos;s callback URL should point to Supabase, not this app.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Expected URL Section */}
            <div className="animate-fade-in-up">
              <p className="text-sm font-semibold mb-2 text-foreground">Expected Callback URL:</p>
              <div className="p-3 bg-muted rounded-md border border-border">
                <code className="text-sm font-mono text-foreground break-all">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL
                    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`
                    : 'https://your-project.supabase.co/auth/v1/callback'}
                </code>
              </div>
              {!process.env.NEXT_PUBLIC_SUPABASE_URL && (
                <p className="text-xs text-muted-foreground mt-1">
                  Note: NEXT_PUBLIC_SUPABASE_URL not found. Check your environment variables.
                </p>
              )}
            </div>

            {/* Detected URL Section */}
            <div className="animate-fade-in-up animation-delay-100">
              <p className="text-sm font-semibold mb-2 text-foreground">GitHub Redirected To:</p>
              <div className="p-3 bg-destructive/10 rounded-md border border-destructive/50">
                <code className="text-sm font-mono text-destructive break-all">
                  {typeof window !== 'undefined'
                    ? `${window.location.origin}/?code=${detectedCode?.substring(0, 8)}...`
                    : 'http://localhost:3000/?code=...'}
                </code>
              </div>
            </div>

            {/* Fix Instructions */}
            <div className="animate-fade-in-up animation-delay-200">
              <p className="text-sm font-semibold mb-2 text-foreground">To fix this:</p>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>
                  Go to{' '}
                  <a
                    href="https://github.com/settings/developers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    GitHub Developer Settings → OAuth Apps
                  </a>
                </li>
                <li>Update <strong className="text-foreground">Authorization callback URL</strong> to match the expected URL above</li>
                <li>Save changes and try signing in again</li>
              </ol>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                window.open('/SETUP_GUIDE.md', '_blank');
              }}
            >
              View Full Setup Guide
            </Button>
            <Button onClick={handleCloseOAuthError}>
              Got It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-12 pb-32">
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8">
            <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-sm text-orange-500 font-medium">AI-Powered Development Journal</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Never lose track of<br />
            <span className="bg-gradient-to-r from-[#F97316] via-[#EAB308] to-[#F97316] bg-clip-text text-transparent">
              your coding progress
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 dark:text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            ReflectAI automatically transforms your commits into meaningful insights. Focus on building, we'll handle the documentation.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#F97316] via-[#EAB308] to-[#F97316] text-white font-semibold px-8 py-6 text-base rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105 transition-all duration-200"
              onClick={handleGitHubLogin}
              disabled={isLoading}
            >
              <Github className="mr-2 h-5 w-5" />
              {isLoading ? 'Connecting...' : 'Connect to Github'}
            </Button>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-white/40">
            <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
            <span>Powered by Google Gemini AI</span>
          </div>
        </div>

        {/* Hero Visual - Enhanced AI Window */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-yellow-500/30 to-orange-500/20 blur-3xl -z-10" />

            {/* Main card */}
            <div className="relative bg-white dark:bg-[#1C1410] backdrop-blur-xl border border-orange-500/30 rounded-2xl p-8 shadow-2xl shadow-orange-500/10">
              {/* Window header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-mono">reflectai-terminal</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/20 border border-orange-500/30">
                  <div className="w-2 h-2 rounded-full bg-orange-500 pulse-dot" />
                  <span className="text-xs text-orange-500 font-medium">AI Analyzing</span>
                </div>
              </div>

              {/* Terminal content */}
              <div className="space-y-4 font-mono text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold">$</span>
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-gray-100 mb-2">git log --oneline -1</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">abc1234 feat: implement user authentication flow</p>
                  </div>
                </div>

                <div className="h-px bg-orange-500/20" />

                <div className="flex items-start gap-3">
                  <span className="text-yellow-500 text-base">✨</span>
                  <div className="flex-1 space-y-2">
                    <p className="text-gray-600 dark:text-gray-400 text-xs">AI Summary Generated:</p>
                    <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
                      <p className="text-gray-700 dark:text-gray-200 text-xs leading-relaxed">
                        Implemented OAuth 2.0 authentication with JWT tokens. Added login/logout routes,
                        session management, and protected route middleware. Integrated with NextAuth for
                        seamless GitHub authentication.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Everything you need to document your work</h2>
          <p className="text-lg text-gray-600 dark:text-white/60">Automated documentation that actually makes sense</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group relative h-full animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-yellow-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-white/60 dark:bg-[#1A1512]/40 backdrop-blur-sm border border-primary/10 rounded-2xl p-8 hover:border-orange-500/30 hover:-translate-y-2 transition-all duration-300 shadow-lg dark:shadow-none flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F97316] to-[#EAB308] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">AI Summaries</h3>
              <p className="text-gray-600 dark:text-white/60 leading-relaxed flex-grow">
                Gemini AI analyzes every commit and generates intelligent technical summaries automatically.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group relative h-full animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-white/60 dark:bg-[#1A1512]/40 backdrop-blur-sm border border-primary/10 rounded-2xl p-8 hover:border-yellow-500/30 hover:-translate-y-2 transition-all duration-300 shadow-lg dark:shadow-none flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#EAB308] to-[#F97316] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Manual Control</h3>
              <p className="text-gray-600 dark:text-white/60 leading-relaxed flex-grow">
                Add context, edit entries, and maintain full control over what gets documented.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group relative h-full animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-red-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-white/60 dark:bg-[#1A1512]/40 backdrop-blur-sm border border-primary/10 rounded-2xl p-8 hover:border-amber-500/30 hover:-translate-y-2 transition-all duration-300 shadow-lg dark:shadow-none flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#EF4444] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Track Progress</h3>
              <p className="text-gray-600 dark:text-white/60 leading-relaxed flex-grow">
                Timeline views and powerful search help you visualize your development journey.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LandingPageContent />
    </Suspense>
  );
}
