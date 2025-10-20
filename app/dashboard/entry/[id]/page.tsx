import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, GitCommit, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface PageProps {
  params: Promise<{ id: string }>;
}

const commandTypeColors = {
  development: 'bg-blue-500/20 dark:bg-blue-500/30 text-blue-700 dark:text-blue-400 border-blue-500/40',
  maintenance: 'bg-yellow-500/20 dark:bg-yellow-500/30 text-yellow-700 dark:text-yellow-400 border-yellow-500/40',
  planning: 'bg-purple-500/20 dark:bg-purple-500/30 text-purple-700 dark:text-purple-400 border-purple-500/40',
};

export default async function EntryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch the journal entry
  const { data: entry, error: entryError } = await supabase
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
    .eq('id', id)
    .single();

  if (entryError || !entry) {
    notFound();
  }

  // Fetch commits associated with this entry
  const { data: commits } = await supabase
    .from('entry_commits')
    .select('commit_sha, commit_message, commit_author, commit_date')
    .eq('entry_id', id)
    .order('commit_date', { ascending: false });

  const sessionDate = new Date(entry.session_date);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-1">
        <div className="container max-w-[900px] mx-auto px-4 py-6 md:py-10">
          {/* Back Link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
          >
            ← Back to Dashboard
          </Link>

          {/* Entry Header */}
          <div className="space-y-4 mb-8">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="font-mono text-xs">
                {entry.repositories.name}
              </Badge>
              <Badge
                variant="secondary"
                className={commandTypeColors[entry.command_type as keyof typeof commandTypeColors]}
              >
                {entry.command_type}
              </Badge>
              {entry.repositories.language && (
                <Badge variant="secondary" className="text-xs">
                  {entry.repositories.language}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-semibold text-neutral-200 leading-tight">
              {entry.user_message}
            </h1>

            {/* Date */}
            <p className="text-sm text-neutral-400">
              {format(sessionDate, 'MMMM d, yyyy')}
            </p>
          </div>

          {/* Summary Section */}
          {entry.ai_summary && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-200 mb-3">
                  SUMMARY
                </h2>
                <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  {entry.ai_summary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Technical Details Section */}
          {entry.ai_technical_details && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-200 mb-3">
                  TECHNICAL DETAILS
                </h2>
                <div
                  className="prose prose-sm dark:prose-invert dark:text-neutral-200 max-w-none"
                  dangerouslySetInnerHTML={{ __html: entry.ai_technical_details }}
                />
              </CardContent>
            </Card>
          )}

          {/* Lessons Learned Section */}
          {entry.user_lessons_learned && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-200 mb-3">
                  LESSONS LEARNED
                </h2>
                <div
                  className="prose prose-sm dark:prose-invert dark:text-neutral-300 max-w-none"
                  dangerouslySetInnerHTML={{ __html: entry.user_lessons_learned }}
                />
              </CardContent>
            </Card>
          )}

          {/* Next Steps Section */}
          {entry.user_next_steps && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-200 mb-3">
                  NEXT STEPS
                </h2>
                <div
                  className="prose prose-sm dark:prose-invert dark:text-neutral-300 max-w-none"
                  dangerouslySetInnerHTML={{ __html: entry.user_next_steps }}
                />
              </CardContent>
            </Card>
          )}

          {/* Commits Section */}
          {commits && commits.length > 0 && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-200 mb-3">
                  COMMITS
                </h2>
                <div className="space-y-3">
                  {commits.map((commit) => (
                    <div
                      key={commit.commit_sha}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      <GitCommit className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{commit.commit_message}</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {commit.commit_author} • {format(new Date(commit.commit_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Link href={`/dashboard/edit/${entry.id}`}>
              <Button size="lg">
                <Edit className="h-4 w-4 mr-2" />
                Edit Entry
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
