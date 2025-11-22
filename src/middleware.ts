import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Check if this is the dashboard subdomain
  const isDashboard = hostname.startsWith('dashboard.')

  // If on dashboard subdomain
  if (isDashboard) {
    // Only allow admin routes on dashboard
    if (!pathname.startsWith('/admin') && 
        !pathname.startsWith('/login') && 
        !pathname.startsWith('/api') &&
        !pathname.startsWith('/_next') &&
        !pathname.startsWith('/favicon')) {
      // Redirect to admin dashboard
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  } else {
    // On main domain (goia.app)
    // Block access to admin routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/login')) {
      // Redirect to dashboard subdomain
      const dashboardUrl = new URL(request.url)
      dashboardUrl.hostname = `dashboard.${hostname}`
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
