import { createClient } from '@/lib/supabase/server';
import { createGitHubClient } from '@/lib/github-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const since = searchParams.get('since'); // Optional: ISO date string

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Missing required parameters: owner and repo' },
        { status: 400 }
      );
    }

    // Get user's session to access provider token
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.provider_token) {
      return NextResponse.json(
        { error: 'Unable to access GitHub. Try logging in again.' },
        { status: 401 }
      );
    }

    // Create GitHub client with provider token
    const github = createGitHubClient(session.provider_token);

    // Fetch repository commits
    const commits = await github.getRepositoryCommits(
      owner,
      repo,
      30,
      since || undefined
    );

    // Format commits for frontend
    const formattedCommits = commits.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      additions: commit.stats?.additions || 0,
      deletions: commit.stats?.deletions || 0,
    }));

    return NextResponse.json({
      success: true,
      commits: formattedCommits,
      count: formattedCommits.length,
    });
  } catch (error: unknown) {
    console.error('Fetch commits error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch commits' },
      { status: 500 }
    );
  }
}
