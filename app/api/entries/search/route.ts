import { createClient } from '@/lib/supabase/server';
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
    const query = searchParams.get('q');
    const repositoryId = searchParams.get('repository_id');
    const commandType = searchParams.get('command_type');
    const limit = parseInt(searchParams.get('limit') || '25');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Call the search function with RLS enforcement
    const { data, error } = await supabase.rpc('search_journal_entries', {
      search_query: query,
      filter_user_id: user.id,
      filter_repository_id: repositoryId || null,
      filter_command_type: commandType || null,
      result_limit: limit,
    });

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      );
    }

    // Fetch repository data for each result
    const enrichedResults = await Promise.all(
      (data || []).map(async (entry: any) => {
        const { data: repo } = await supabase
          .from('repositories')
          .select('name, full_name, language')
          .eq('id', entry.repository_id)
          .single();

        return {
          ...entry,
          repositories: repo,
        };
      })
    );

    return NextResponse.json({
      success: true,
      results: enrichedResults,
      count: enrichedResults.length,
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}
