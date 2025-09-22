// Admin authentication utilities
import { supabase } from './supabase'

export interface AdminUser {
  id: string
  email: string
  password_hash: string
  role: 'admin' | 'super_admin'
  created_at: string
  last_login?: string
}

// Simple password hashing (in production, use bcrypt)
function hashPassword(password: string): string {
  // This is a simple hash for demo purposes
  // In production, use bcrypt or similar
  return btoa(password + 'vela_salt_2024')
}

// Verify password
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

// Check if user is admin
export async function isAdmin(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', email)
      .single()

    return !error && !!data
  } catch {
    return false
  }
}

// Authenticate admin user
export async function authenticateAdmin(email: string, password: string): Promise<AdminUser | null> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !data) {
      return null
    }

    if (!verifyPassword(password, data.password_hash)) {
      return null
    }

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.id)

    return data
  } catch {
    return null
  }
}

// Create admin user
export async function createAdminUser(email: string, password: string, role: 'admin' | 'super_admin' = 'admin'): Promise<AdminUser | null> {
  try {
    const passwordHash = hashPassword(password)
    
    const { data, error } = await supabase
      .from('admin_users')
      .insert([
        {
          email,
          password_hash: passwordHash,
          role,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating admin user:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating admin user:', error)
    return null
  }
}

// Get all admin users
export async function getAllAdminUsers(): Promise<AdminUser[]> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching admin users:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return []
  }
}

// Delete admin user
export async function deleteAdminUser(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id)

    return !error
  } catch {
    return false
  }
}
