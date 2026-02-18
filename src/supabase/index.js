import { createClient } from '@supabase/supabase-js'

// Use the VITE_ prefix so Vite can see these variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// This is the line Vercel is looking for:
export const supabase = createClient(supabaseUrl, supabaseAnonKey)