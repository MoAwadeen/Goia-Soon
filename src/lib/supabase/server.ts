import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const createClient = async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!url || !anonKey) {
    console.warn(
      'Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable data fetching.'
    )
    return null
  }

  // Validate URL format
  try {
    const parsedUrl = new URL(url)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Protocol must be http or https')
    }
  } catch (error) {
    console.error('Invalid Supabase URL:', url, error)
    return null
  }

  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}


