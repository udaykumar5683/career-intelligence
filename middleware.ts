import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = await createClient(request)

  let user = null;
  try {
    const { data: { user: authUser }, error } = await supabase.auth.getUser()
    if (error) {
      // Log error but don't crash
      console.warn('Middleware Auth Error:', error.message)
    }
    user = authUser;
  } catch (err) {
    console.error('Middleware Auth Unexpected Error:', err)
  }

  // If logged in and trying to access /login or /signup, redirect to dashboard
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
