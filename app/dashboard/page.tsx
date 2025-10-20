'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Timeline } from '@/components/dashboard/Timeline';
import { FilterBar } from '@/components/dashboard/FilterBar';

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [entries, setEntries] = useState<any[]>([]);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Get filter params from URL
  const repoParam = searchParams.get('repo') || 'all';
  const typeParam = searchParams.get('type') || 'all';

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch journal entries with repository data
      const { data: entriesData } = await supabase
        .from('journal_entries')
        .select(`
          *,
          repositories (
            id,
            name,
            full_name,
            language
          )
        `)
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })
        .limit(50);

      // Fetch user's repositories for filter
      const { data: reposData } = await supabase
        .from('repositories')
        .select('id, name, full_name')
        .eq('user_id', user.id)
        .order('name');

      setEntries(entriesData || []);
      setRepositories(reposData || []);
      setIsLoading(false);
    }

    fetchData();
  }, []);

  // Filter entries based on URL params and search query
  const filteredEntries = entries.filter((entry) => {
    // Filter by repository
    if (repoParam !== 'all' && entry.repositories?.id !== repoParam) {
      return false;
    }

    // Filter by type
    if (typeParam !== 'all' && entry.command_type !== typeParam) {
      return false;
    }

    // Filter by search query (case-insensitive, checks message field)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const message = entry.user_message?.toLowerCase() || '';
      const summary = entry.ai_summary?.toLowerCase() || '';
      
      if (!message.includes(query) && !summary.includes(query)) {
        return false;
      }
    }

    return true;
  });

  const handleRepoChange = (repoId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (repoId === 'all') {
      params.delete('repo');
    } else {
      params.set('repo', repoId);
    }
    
    const newUrl = params.toString() ? `/dashboard?${params.toString()}` : '/dashboard';
    router.push(newUrl);
  };

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (type === 'all') {
      params.delete('type');
    } else {
      params.set('type', type);
    }
    
    const newUrl = params.toString() ? `/dashboard?${params.toString()}` : '/dashboard';
    router.push(newUrl);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    router.push('/dashboard');
  };

  const hasEntries = entries && entries.length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with animations */}
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-br from-foreground to-primary bg-clip-text text-transparent">
            Your Development Journal
          </h1>
          <p className="text-muted-foreground mt-1 animate-fade-in-up animation-delay-100">
            Track your coding sessions and reflect on your progress
          </p>
        </div>
        <Link href="/dashboard/new-entry" className="animate-fade-in-left animation-delay-100">
          <Button 
            size="lg"
            className="hover-scale hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(167,139,250,0.4)] transition-all duration-300"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            New Entry
          </Button>
        </Link>
      </div>

      {/* Filter Bar with animation */}
      {hasEntries && repositories && (
        <div className="animate-fade-in-up animation-delay-200">
          <FilterBar 
            repositories={repositories}
            currentRepo={repoParam}
            currentType={typeParam}
            currentSearch={searchQuery}
            onRepoChange={handleRepoChange}
            onTypeChange={handleTypeChange}
            onSearchChange={handleSearchChange}
            onClearFilters={handleClearFilters}
          />
        </div>
      )}

      {/* Timeline or Empty State */}
      {hasEntries ? (
        <div className="animate-fade-in">
          <Timeline entries={filteredEntries} />
        </div>
      ) : (
        <Card className="mt-8 max-w-2xl mx-auto animate-scale-in animation-delay-300 hover-lift">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4 animate-float" />
            <CardTitle className="mb-2 text-center">No journal entries yet</CardTitle>
            <CardDescription className="text-center max-w-md mb-6">
              Start documenting your development journey by creating your first journal entry.
              Connect a repository, describe your work, and let AI help you reflect.
            </CardDescription>
            <Link href="/dashboard/new-entry">
              <Button className="hover-scale hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(167,139,250,0.4)] transition-all duration-300">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create First Entry
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
