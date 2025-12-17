import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Get auth cookie (backend sets 'token' cookie)
  const authCookie = request.cookies.get('token')
  const hasValidToken = authCookie && authCookie.value

  // If accessing login page while authenticated, redirect to dashboard
  if (pathname === '/login' && hasValidToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If accessing protected route without token, redirect to login
  if (!isPublicRoute && !hasValidToken) {
    const loginUrl = new URL('/login', request.url)
    // Store the attempted URL to redirect back after login
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
}