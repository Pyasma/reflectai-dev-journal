import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
  const { data: entries, error } = await supabase
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Development Journal</h1>
          <p className="text-muted-foreground mt-1">
            Track your coding sessions and reflect on your progress
          </p>
        </div>
        <Link href="/dashboard/new-entry">
          <Button size="lg">
            <PlusCircle className="mr-2 h-5 w-5" />
            New Entry
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      {hasEntries && repositories && (
        <FilterBar repositories={repositories} />
      )}

      {/* Timeline or Empty State */}
      {hasEntries ? (
        <Timeline entries={entries} />
      ) : (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No journal entries yet</CardTitle>
            <CardDescription className="text-center max-w-md mb-6">
              Start documenting your development journey by creating your first journal entry.
              Connect a repository, describe your work, and let AI help you reflect.
            </CardDescription>
            <Link href="/dashboard/new-entry">
              <Button>
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
