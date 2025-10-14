import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();

    try {
      // Exchange code for session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Authentication error occurred', exchangeError);
        return NextResponse.redirect(`${origin}/?error=auth_failed`);
      }

      if (!data.user) {
        return NextResponse.redirect(`${origin}/?error=auth_failed`);
      }

      // Get GitHub provider token for API access
      const providerToken = data.session?.provider_token;
      const githubUsername = data.user.user_metadata?.user_name;
      const githubAvatarUrl = data.user.user_metadata?.avatar_url;

      // Upsert user profile
      try {
        const { error: userError } = await supabase
          .from('users')
          .upsert(
            {
              id: data.user.id,
              github_username: githubUsername,
              github_avatar_url: githubAvatarUrl,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'id',
            }
          );

        if (userError) {
          console.error('User upsert error:', userError);
        }
      } catch (error) {
        console.error('User upsert error:', error);
      }

      // Create/update default user settings (always overwrite)
      try {
        const { error: settingsError } = await supabase
          .from('user_settings')
          .upsert(
            {
              user_id: data.user.id,
              gemini_model_preference: 'gemini-2.0-flash-exp',
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'user_id',
            }
          );

        if (settingsError) {
          console.error('Failed to create/update user settings', settingsError);
        }
      } catch (error) {
        console.error('Failed to create/update user settings', error);
      }

      // Try to sync GitHub profile (non-blocking)
      if (providerToken) {
        try {
          // This will be handled by the sync-repos API route later
          // For now, just log that we have the token
          console.log('GitHub provider token available for future sync');
        } catch (error) {
          console.error('GitHub profile sync failed:', error);
          // Continue to dashboard anyway
        }
      }

      // Redirect to dashboard
      return NextResponse.redirect(`${origin}/dashboard`);
    } catch (error) {
      console.error('Authentication error occurred', error);
      return NextResponse.redirect(`${origin}/?error=auth_failed`);
    }
  }

  // No code provided, redirect to home
  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}
