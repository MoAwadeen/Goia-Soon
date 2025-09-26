import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      return NextResponse.json({
        status: 'not_configured',
        message: 'Supabase is not configured. Please set up your environment variables.',
        required_vars: [
          'NEXT_PUBLIC_SUPABASE_URL',
          'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
          'SUPABASE_SERVICE_ROLE_KEY'
        ]
      });
    }

    // Test the connection by trying to query the database
    const { data, error } = await supabaseAdmin
      .from('early_adopters')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase connection failed',
        error: error.message,
        hint: 'Make sure your database table exists and RLS is configured properly'
      });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection successful!',
      database_accessible: true
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
