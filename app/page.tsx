'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { Github, BookOpen, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-[rgba(58, 29, 147, 0.05)]">
      {/* Header with Theme Toggle */}
      <header className="border-b border-[rgba(167,139,250,0.15)] dark:border-[rgba(167,139,250,0.2)] px-6 py-4 backdrop-blur-sm bg-card/50">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-br from-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent">ReflectAI</h1>
          <ThemeToggle />
        </div>
      </header>

      {/* OAuth Misconfiguration Modal */}
      <Dialog open={showOAuthError} onOpenChange={(open) => {
        if (!open) handleCloseOAuthError();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <DialogTitle className="text-xl">GitHub OAuth Misconfiguration Detected</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              GitHub is redirecting to the wrong URL. Your OAuth App&apos;s callback URL should point to Supabase, not this app.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Expected URL Section */}
            <div>
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
            <div>
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
            <div>
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

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-br from-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent">ReflectAI</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered development journal that automatically logs and reflects on your coding sessions
          </p>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="max-w-md mx-auto mb-8">
            <Card className="border-destructive/50 bg-destructive/10 glass-card-light dark:glass-card">
              <CardContent className="flex items-center gap-3 p-4">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CTA Card */}
        <Card className="max-w-md mx-auto mb-16 glass-card-light dark:glass-card glow-inner-light">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Get Started</h2>
            <p className="text-muted-foreground mb-6">
              Sign in with GitHub to start tracking your development journey
            </p>
            <Button
              onClick={handleGitHubLogin}
              disabled={isLoading}
              size="lg"
              className="w-full"
            >
              <Github className="mr-2 h-5 w-5" />
              {isLoading ? 'Connecting...' : 'Sign in with GitHub'}
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              We only access your public repositories
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <Sparkles className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">AI-Powered Summaries</h3>
              <p className="text-sm text-muted-foreground">
                Gemini AI generates comprehensive summaries of your coding sessions, extracting technical details and insights
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <BookOpen className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Manual Control</h3>
              <p className="text-sm text-muted-foreground">
                Create journal entries on your terms. Select commits, add context, and let AI help document your work
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <TrendingUp className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Visualize your development journey with timeline views, statistics, and searchable journal entries
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LandingPageContent />
    </Suspense>
  );
}
