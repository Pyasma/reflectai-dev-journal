import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware'; // Assuming this is your actual updateSession utility

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  
  // CRITICAL: Check for the bypass flag added by the callback route
  if (url.searchParams.has('auth-bypass')) {
    
    // Create the final URL without the bypass parameter
    url.searchParams.delete('auth-bypass');
    
    // Redirect with a 307 status to the clean URL, allowing the middleware
    // to complete its job, but preventing an immediate session re-check.
    return NextResponse.redirect(url, { status: 307 });
  }

  // For all other requests (not the immediate OAuth callback redirect), 
  // proceed with normal session management.
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (or any other static folder you might use)
     * - regex for image files (for robustness)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};