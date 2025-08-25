import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our wallpaper data
export interface Wallpaper {
  id: string
  title: string
  description: string | null
  tags: string[] | null
  category: string
  image_url: string
  created_at: string
  resolution?: string
  file_size?: number
  color_palette?: string[]
  download_count?: number
  average_rating?: number
  featured?: boolean
  device_type?: string
}
