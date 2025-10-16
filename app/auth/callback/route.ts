import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  // The destination path after successful authentication
  const dashboardPath = '/dashboard';
  
  // CRITICAL: Append a bypass flag to prevent middleware issues on first load
  const finalRedirectURL = `${origin}${dashboardPath}?auth-bypass=true`;
  
  // Default redirect on failure
  const failureRedirectURL = `${origin}/?error=auth_failed`;

  if (code) {
    const supabase = await createClient();

    try {
      // 1. Exchange code for session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError || !data.user) {
        console.error('Authentication error occurred during code exchange:', exchangeError);
        return NextResponse.redirect(failureRedirectURL);
      }

      // --- Database Operations (Upsert User/Settings) ---
      
      const githubUsername = data.user.user_metadata?.user_name;
      const githubAvatarUrl = data.user.user_metadata?.avatar_url;

      // 1. Upsert user profile (Corrected usage with try...catch)
      try {
        const { error: userError } = await supabase
            .from('users')
            .upsert({
              id: data.user.id,
              github_username: githubUsername,
              github_avatar_url: githubAvatarUrl,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });

        if (userError) {
          console.error('User upsert Postgrest error:', userError);
        }
      } catch (error: unknown) {
        // Catches any general runtime error or network error during upsert.
        console.error('User upsert runtime error:', error);
      }

      // 2. Create/update default user settings (Corrected usage with try...catch)
      try {
        const { error: settingsError } = await supabase
            .from('user_settings')
            .upsert({
              user_id: data.user.id,
              gemini_model_preference: 'gemini-2.0-flash-exp',
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

        if (settingsError) {
          console.error('Settings upsert Postgrest error:', settingsError);
        }
      } catch (error: unknown) {
        // Catches any general runtime error or network error during upsert.
        console.error('Settings upsert runtime error:', error);
      }

      // 3. Redirect to dashboard with the bypass flag
      return NextResponse.redirect(finalRedirectURL);

    } catch (error: unknown) { 
      // Catches errors during code exchange or other critical parts of the outer block
      console.error('General authentication error occurred:', error);
      return NextResponse.redirect(failureRedirectURL);
    }
  }

  // No code provided (initial OAuth request failed or malformed)
  return NextResponse.redirect(failureRedirectURL);
}