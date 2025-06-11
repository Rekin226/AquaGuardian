import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface User {
  id: string
  email: string
  role: 'farmer' | 'buyer' | 'admin'
  created_at: string
}

export interface Design {
  id: string
  user_id: string
  name: string
  params: {
    farmSize?: string
    fishSpecies?: string[]
    cropChoice?: string[]
    budget?: string
    energySource?: string
  }
  created_at: string
}

export interface Token {
  id: string
  design_id: string
  algorand_tx?: string
  created_at: string
}