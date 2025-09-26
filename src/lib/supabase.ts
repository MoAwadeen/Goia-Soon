import { createClient } from '@supabase/supabase-js';

// Simple function to create Supabase client safely
function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anonKey) {
    return null;
  }
  
  try {
    return createClient(url, anonKey);
  } catch (error) {
    console.warn('Failed to create Supabase client:', error);
    return null;
  }
}

function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) {
    return null;
  }
  
  try {
    return createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } catch (error) {
    console.warn('Failed to create Supabase admin client:', error);
    return null;
  }
}

// Export clients
export const supabase = createSupabaseClient();
export const supabaseAdmin = createSupabaseAdminClient();
