import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, GitCommit, FolderGit2, TrendingUp } from 'lucide-react';

export default async function StatisticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch all-time statistics
  const { data: allEntries } = await supabase
    .from('journal_entries')
    .select('id, command_type, repository_id, created_at')
    .eq('user_id', user.id);

  const { data: allCommits } = await supabase
    .from('entry_commits')
    .select('id, entry_id')
    .in(
      'entry_id',
      allEntries?.map((e) => e.id) || []
    );

  const { data: repositories } = await supabase
    .from('repositories')
    .select('id, name')
    .eq('user_id', user.id);

  // Calculate stats
  const totalEntries = allEntries?.length || 0;
  const totalCommits = allCommits?.length || 0;
  const activeRepositories = new Set(allEntries?.map((e) => e.repository_id)).size;

  // Count by command type
  const entriesByType = allEntries?.reduce((acc: Record<string, number>, entry) => {
    acc[entry.command_type] = (acc[entry.command_type] || 0) + 1;
    return acc;
  }, {});

  // Get recent 7 days statistics
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentEntries } = await supabase
    .from('journal_entries')
    .select('id, created_at')
    .eq('user_id', user.id)
    .gte('created_at', sevenDaysAgo.toISOString());

  const recentEntriesCount = recentEntries?.length || 0;

  // Top repositories
  const repoStats = allEntries?.reduce((acc: Record<string, { count: number; repoId: string }>, entry) => {
    const repoId = entry.repository_id;
    if (!acc[repoId]) {
      acc[repoId] = { count: 0, repoId };
    }
    acc[repoId].count += 1;
    return acc;
  }, {});

  const topRepos = Object.values(repoStats || {})
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((stat) => {
      const repo = repositories?.find((r) => r.id === stat.repoId);
      return {
        name: repo?.name || 'Unknown',
        count: stat.count,
      };
    });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Statistics</h1>
        <p className="text-muted-foreground mt-1">
          Track your development activity and progress
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Total Entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEntries}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {recentEntriesCount} in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <GitCommit className="h-4 w-4" />
              Total Commits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCommits}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FolderGit2 className="h-4 w-4" />
              Active Repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeRepositories}</div>
            <p className="text-xs text-muted-foreground mt-1">
              With journal entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Average per Week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalEntries > 0 ? Math.round(totalEntries / Math.max(1, Math.ceil(totalEntries / 7))) : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Journal entries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Entries by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Entries by Type</CardTitle>
          <CardDescription>
            Breakdown of your journal entries by session type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(entriesByType || {}).map(([type, count]: [string, number]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-medium capitalize">{type}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    {Math.round((count / totalEntries) * 100)}%
                  </div>
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(count / totalEntries) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm font-semibold w-8 text-right">{count}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Repositories */}
      <Card>
        <CardHeader>
          <CardTitle>Most Active Repositories</CardTitle>
          <CardDescription>
            Repositories with the most journal entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topRepos.length > 0 ? (
              topRepos.map((repo, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium">{repo.name}</span>
                  </div>
                  <div className="text-sm font-semibold">{repo.count} entries</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No data available yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
