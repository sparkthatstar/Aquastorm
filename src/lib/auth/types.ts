export type UserRole = 'customer' | 'vendor' | 'manager' | 'owner'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: UserRole
  is_active: boolean
  bank_name?: string | null
  account_name?: string | null
  account_number?: string | null
}
