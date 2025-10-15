import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Github, Mail, Calendar, GitBranch, BookOpen, Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('github_username, github_avatar_url, created_at')
    .eq('id', user.id)
    .single();

  // Fetch user statistics
  const { data: repositories, count: repoCount } = await supabase
    .from('repositories')
    .select('*', { count: 'exact', head: false })
    .eq('user_id', user.id);

  const { data: journalEntries, count: entryCount } = await supabase
    .from('journal_entries')
    .select('*', { count: 'exact', head: false })
    .eq('user_id', user.id);

  const { count: commitCount } = await supabase
    .from('entry_commits')
    .select('*', { count: 'exact', head: true })
    .in('entry_id', journalEntries?.map(e => e.id) || []);

  // Get recent activity
  const recentEntries = journalEntries?.slice(0, 5) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Your account information and activity
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.github_avatar_url || ''} alt={profile?.github_username || 'User'} />
                <AvatarFallback className="text-2xl">
                  {profile?.github_username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <div>
                <h3 className="font-semibold text-lg">{profile?.github_username || 'User'}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

              {profile?.github_username && (
                <a
                  href={`https://github.com/${profile.github_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    <Github className="mr-2 h-4 w-4" />
                    View on GitHub
                  </Button>
                </a>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground truncate">{user.email}</span>
              </div>

              {profile?.created_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            <Link href="/settings">
              <Button variant="default" size="sm" className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="md:col-span-2 space-y-6">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Journal Entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="text-3xl font-bold">{entryCount || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Repositories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-primary" />
                  <span className="text-3xl font-bold">{repoCount || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Commits Tracked</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Github className="h-5 w-5 text-primary" />
                  <span className="text-3xl font-bold">{commitCount || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest journal entries</CardDescription>
            </CardHeader>
            <CardContent>
              {recentEntries.length > 0 ? (
                <div className="space-y-4">
                  {recentEntries.map((entry) => {
                    const repo = repositories?.find(r => r.id === entry.repository_id);
                    return (
                      <div key={entry.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {repo?.name || 'Unknown'}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {entry.command_type}
                            </Badge>
                          </div>
                          <p className="text-sm line-clamp-2">{entry.user_message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.session_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No journal entries yet</p>
                  <Link href="/dashboard/new-entry">
                    <Button variant="outline" size="sm" className="mt-4">
                      Create Your First Entry
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
