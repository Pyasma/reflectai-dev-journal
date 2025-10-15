'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { Github, BookOpen, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';

function LandingPageContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for auth error from callback
    const errorParam = searchParams.get('error');
    if (errorParam === 'auth_failed') {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-5xl font-bold text-foreground">ReflectAI</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered development journal that automatically logs and reflects on your coding sessions
          </p>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="max-w-md mx-auto mb-8">
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="flex items-center gap-3 p-4">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CTA Card */}
        <Card className="max-w-md mx-auto mb-16 shadow-lg">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
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
              <h3 className="text-lg font-semibold mb-2">AI-Powered Summaries</h3>
              <p className="text-sm text-muted-foreground">
                Gemini AI generates comprehensive summaries of your coding sessions, extracting technical details and insights
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <BookOpen className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Manual Control</h3>
              <p className="text-sm text-muted-foreground">
                Create journal entries on your terms. Select commits, add context, and let AI help document your work
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <TrendingUp className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Visualize your development journey with timeline views, statistics, and searchable journal entries
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-sm text-muted-foreground">
          <p>Built with Next.js, Supabase, and Google Gemini</p>
        </footer>
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
