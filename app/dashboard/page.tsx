import { createClient } from '@/lib/supabase/server';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Timeline } from '@/components/dashboard/Timeline';
import { FilterBar } from '@/components/dashboard/FilterBar';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch journal entries with repository data
  const { data: entries } = await supabase
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
  const { data: repositories } = await supabase
    .from('repositories')
    .select('id, name, full_name')
    .eq('user_id', user.id)
    .order('name');

  const hasEntries = entries && entries.length > 0;

  return (
    <div className="space-y-6">
      {/* Header with animations */}
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
            Your Development Journal
          </h1>
          <p className="text-muted-foreground mt-1 animate-fade-in-up animation-delay-100">
            Track your coding sessions and reflect on your progress
          </p>
        </div>
        <Link href="/dashboard/new-entry" className="animate-fade-in-left animation-delay-100">
          <Button 
            size="lg"
            className="hover-scale hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all duration-300"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            New Entry
          </Button>
        </Link>
      </div>

      {/* Filter Bar with animation */}
      {hasEntries && repositories && (
        <div className="animate-fade-in-up animation-delay-200">
          <FilterBar repositories={repositories} />
        </div>
      )}

      {/* Timeline or Empty State */}
      {hasEntries ? (
        <div className="animate-fade-in">
          <Timeline entries={entries} />
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
              <Button className="hover-scale hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all duration-300">
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
