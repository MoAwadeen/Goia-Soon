import { NextRequest, NextResponse } from 'next/server';
import { getResendClient } from '@/lib/resend';
import { getAcceptanceEmailTemplate, getRejectionEmailTemplate, getEmailTemplateSubject } from '@/lib/email-templates';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { applicationId, emailType } = await request.json();

    if (!applicationId || !emailType) {
      return NextResponse.json(
        { error: 'applicationId and emailType are required' },
        { status: 400 }
      );
    }

    if (emailType !== 'accepted' && emailType !== 'rejected') {
      return NextResponse.json(
        { error: 'emailType must be "accepted" or "rejected"' },
        { status: 400 }
      );
    }

    // Get application details from database
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection unavailable' },
        { status: 500 }
      );
    }

    const { data: application, error: appError } = await supabase
      .from('job_applications')
      .select('*, jobs(title)')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      console.error('Error fetching application:', appError);
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Get job title - jobs is returned as an object with title property
    const jobTitle = (application.jobs as { title: string } | null)?.title || 'the position';

    // Initialize Resend client
    const resend = getResendClient();
    if (!resend) {
      return NextResponse.json(
        { error: 'Email service is not configured. Please set RESEND_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Prepare email data
    const emailData = {
      applicantName: application.full_name,
      jobTitle: jobTitle,
    };

    // Get the appropriate email template from database
    const htmlContent = emailType === 'accepted'
      ? await getAcceptanceEmailTemplate(emailData)
      : await getRejectionEmailTemplate(emailData);

    // Get subject from database template or use default
    const subject = await getEmailTemplateSubject(emailType as 'accepted' | 'rejected', emailData);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Goia Careers <careers@goia.app>',
      to: application.email,
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend email error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: data?.id,
    });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

