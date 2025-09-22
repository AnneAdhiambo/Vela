import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface WaitlistEntry {
  id?: string
  email: string
  name: string
  created_at?: string
  status?: 'pending' | 'notified' | 'converted'
}

export interface Subscriber {
  id?: string
  email: string
  status?: 'active' | 'inactive' | 'unsubscribed'
  subscription_type?: 'weekly' | 'daily' | 'monthly'
  created_at?: string
}
