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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  const publicRoutes = ['/login', '/signup', '/auth/callback', '/', '/forgot-password']
  if (publicRoutes.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
    if (user && (pathname === '/login' || pathname === '/signup')) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile) return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  if (!user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  const { data: profile } = await supabase.from('profiles').select('role, is_active').eq('id', user.id).single()

  if (!profile || !profile.is_active) {
    return NextResponse.redirect(new URL('/login?error=inactive', request.url))
  }

  if (!canAccess(profile.role, pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)'],
}
