import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Add to Supabase database
    const result = await addToSupabase(email);

    if (result.success) {
      return NextResponse.json(
        { message: 'Successfully subscribed to early access list' },
        { status: 200 }
      );
    } else {
      console.error('Supabase error:', result.error);
      return NextResponse.json(
        { error: 'Failed to add email to list' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Subscription API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function addToSupabase(email: string) {
  try {
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      // Fallback: just log the email for now
      console.log('📧 New email subscription (Supabase not configured):', email);
      console.log('📅 Timestamp:', new Date().toISOString());
      console.log('💡 To enable database storage, configure Supabase environment variables');
      return { success: true };
    }

    // Check if email already exists
    const { data: existingEmails, error: checkError } = await supabaseAdmin
      .from('early_adopters')
      .select('email')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new emails
      throw new Error(`Database check error: ${checkError.message}`);
    }

    if (existingEmails) {
      return { success: false, error: 'Email already subscribed' };
    }

    // Insert new email subscription
    const { data, error } = await supabaseAdmin
      .from('early_adopters')
      .insert([
        {
          email: email,
          subscribed_at: new Date().toISOString(),
          status: 'active'
        }
      ])
      .select();

    if (error) {
      throw new Error(`Database insert error: ${error.message}`);
    }

    console.log('✅ New email subscription added to database:', data);
    return { success: true };
  } catch (error) {
    console.error('Supabase integration error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

