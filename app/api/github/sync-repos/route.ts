import { createClient } from '@/lib/supabase/server';
import { createGitHubClient } from '@/lib/github-client';
import { NextResponse } from 'next/server';

export async function POST() {
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

    // Fetch user's public repositories
    const repositories = await github.getUserRepositories();

    // Upsert repositories to database
    const reposToUpsert = repositories.map((repo) => ({
      user_id: user.id,
      github_repo_id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      language: repo.language,
      is_private: repo.private,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error: upsertError } = await supabase
      .from('repositories')
      .upsert(reposToUpsert, {
        onConflict: 'user_id,github_repo_id',
        ignoreDuplicates: false,
      })
      .select();

    if (upsertError) {
      console.error('Repository upsert error:', upsertError);
      return NextResponse.json(
        { error: 'Failed to sync repositories' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      repositories: data,
    });
  } catch (error: unknown) {
    console.error('Sync repositories error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync repositories' },
      { status: 500 }
    );
  }
}
