import { createClient } from '@supabase/supabase-js';

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key' &&
         process.env.SUPABASE_SERVICE_ROLE_KEY &&
         process.env.SUPABASE_SERVICE_ROLE_KEY !== 'placeholder-service-key';
};

// Only create clients if Supabase is properly configured
export const supabase = (() => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  
  try {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  } catch (error) {
    console.warn('Failed to create Supabase client:', error);
    return null;
  }
})();

// Server-side client for API routes
export const supabaseAdmin = (() => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  
  try {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  } catch (error) {
    console.warn('Failed to create Supabase admin client:', error);
    return null;
  }
})();
