import { createClient } from '@supabase/supabase-js'

// 1. Retrieve the variables from the Vite environment
const supabaseUrl = import.meta.env.SUPABASE_URL 
const supabaseAnonKey = import.meta.env.SUPABASE_KEY

// 2. Validation: Codespaces can sometimes fail to load envs if the terminal isn't restarted
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Key are required. Check your .env file!')
}

// 3. Initialize the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)