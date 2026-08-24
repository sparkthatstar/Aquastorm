import type { UserRole } from './types'

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'customer':
    case 'vendor':
    case 'manager':
    case 'owner':
      return '/dashboard'
    default:
      return '/login'
  }
}

export const ROLE_ROUTES: Record<UserRole, string[]> = {
  customer: ['/customer-dashboard', '/customer-orders', '/profile', '/chat', '/notifications', '/support', '/settings'],
  vendor: ['/vendor-dashboard', '/vendor-orders', '/profile', '/chat', '/notifications', '/inventory', '/points', '/cashout', '/settings'],
  manager: ['/manager-dashboard', '/vendor-orders', '/vendors', '/customers', '/inventory', '/support', '/payments', '/ratings', '/notifications', '/analytics', '/settings'],
  owner: ['/owner-dashboard', '/vendor-orders', '/vendors', '/customers', '/managers', '/inventory', '/support', '/payments', '/ratings', '/communications', '/audit', '/points', '/cashout', '/analytics', '/settings', '/notifications'],
}

export function canAccessPath(role: UserRole, pathname: string): boolean {
  const allowed = ROLE_ROUTES[role]
  return allowed.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )
}
