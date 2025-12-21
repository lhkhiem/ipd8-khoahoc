import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Get auth cookie (backend sets 'token' cookie)
  const authCookie = request.cookies.get('token')
  const token = authCookie?.value

  // If accessing login page while authenticated, verify and redirect
  if (pathname === '/login' && token) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || ''
      )
      if (secret.length > 0) {
        await jwtVerify(token, secret)
        // Token valid, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      // Token invalid, allow access to login and clear cookie
      const response = NextResponse.next()
      response.cookies.delete('token')
      return response
    }
  }

  // If accessing protected route without token, redirect to login
  if (!isPublicRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    // Store the attempted URL to redirect back after login
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If accessing protected route with token, verify it
  if (!isPublicRoute && token) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || ''
      )
      
      if (secret.length === 0) {
        // No secret configured, redirect to login
        console.warn('[Middleware] JWT_SECRET not configured')
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      const { payload } = await jwtVerify(token, secret)
      
      // Token is valid, allow access
      // Optionally add user info to headers for use in pages
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', String(payload.id || ''))
      requestHeaders.set('x-user-email', String(payload.email || ''))
      requestHeaders.set('x-user-role', String(payload.role || ''))
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      // Token invalid or expired, redirect to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      
      // Clear invalid cookie
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('token')
      return response
    }
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