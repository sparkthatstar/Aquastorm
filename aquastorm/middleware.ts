import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const ROLE_ROUTE_MAP: Record<string, string[]> = {
  customer: ['/customer-dashboard', '/customer-orders', '/profile', '/chat', '/notifications', '/support', '/settings'],
  vendor: ['/vendor-dashboard', '/vendor-orders', '/profile', '/chat', '/notifications', '/inventory', '/points', '/cashout', '/settings'],
  manager: ['/manager-dashboard', '/vendor-orders', '/vendors', '/customers', '/inventory', '/support', '/payments', '/ratings', '/notifications', '/analytics', '/settings'],
  owner: ['/owner-dashboard', '/vendor-orders', '/vendors', '/customers', '/managers', '/inventory', '/support', '/payments', '/ratings', '/communications', '/audit', '/points', '/cashout', '/analytics', '/settings', '/notifications'],
}

function canAccess(role: string, pathname: string): boolean {
  const allowed = ROLE_ROUTE_MAP[role]
  if (!allowed) return false
  return allowed.some((route) => pathname === route || pathname.startsWith(route + '/'))
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // 1. Check if Supabase keys exist (prevents instant crash)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Missing Supabase Environment Variables in Vercel!")
    return response // Let the page load so we can see other errors
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // 2. Let people visit the homepage, login, and signup without being blocked
  const publicRoutes = ['/login', '/signup', '/auth/callback', '/', '/forgot-password']
  if (publicRoutes.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
    // If they are logged in and go to login, send them to the Traffic Cop (/)
    if (user && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    // Otherwise, let them view the page
    return response
  }

  // 3. If they try to visit a protected page (like /owner-dashboard) without logging in
  if (!user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 4. Fetch their role
  const { data: profile } = await supabase.from('profiles').select('role, is_active').eq('id', user.id).single()

  if (!profile || !profile.is_active) {
    return NextResponse.redirect(new URL('/login?error=inactive', request.url))
  }

  // 5. If they don't have permission (e.g., customer trying to view /owner-dashboard)
  if (!canAccess(profile.role, pathname)) {
    // Send them to the Traffic Cop (/) which will redirect them to THEIR dashboard
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)'],
}
