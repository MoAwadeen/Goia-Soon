import { createClient } from '@/lib/supabase/server';

interface EmailData {
  applicantName: string;
  jobTitle: string;
}

const DEFAULT_ACCEPTANCE_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Accepted</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #E10112 0%, #c70110 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Congratulations, {applicantName}!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; margin: 0 0 20px 0;">
      We're thrilled to inform you that your application for the <strong>{jobTitle}</strong> position has been accepted!
    </p>
    
    <p style="font-size: 16px; margin: 0 0 20px 0;">
      Your skills and experience stood out among many candidates, and we believe you'll be a valuable addition to our team.
    </p>
    
    <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 15px; color: #1e40af;">
        <strong>Next Steps:</strong><br>
        Our team will reach out to you shortly with further details about the onboarding process and to discuss the next steps.
      </p>
    </div>
    
    <p style="font-size: 16px; margin: 30px 0 0 0;">
      We're excited to welcome you to Goia!
    </p>
    
    <p style="font-size: 16px; margin: 20px 0 0 0;">
      Best regards,<br>
      <strong>The Goia Careers Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 14px; margin: 0;">
      Goia Careers | careers@goia.app
    </p>
  </div>
</body>
</html>`

const DEFAULT_REJECTION_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Update</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f8fafc; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; border: 1px solid #e5e7eb; border-bottom: none;">
    <h1 style="color: #1f2937; margin: 0; font-size: 28px;">Thank you, {applicantName}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; margin: 0 0 20px 0;">
      Thank you for your interest in joining Goia and for taking the time to apply for the <strong>{jobTitle}</strong> position.
    </p>
    
    <p style="font-size: 16px; margin: 0 0 20px 0;">
      After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs for this role.
    </p>
    
    <p style="font-size: 16px; margin: 0 0 20px 0;">
      We appreciate the effort you put into your application and encourage you to keep an eye on our careers page for future opportunities that may be a better fit.
    </p>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 15px; color: #92400e;">
        We value your interest in Goia and wish you the best in your career journey.
      </p>
    </div>
    
    <p style="font-size: 16px; margin: 30px 0 0 0;">
      Best regards,<br>
      <strong>The Goia Careers Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 14px; margin: 0;">
      Goia Careers | careers@goia.app
    </p>
  </div>
</body>
</html>`

async function getTemplateFromDatabase(type: 'accepted' | 'rejected'): Promise<{ html_content: string; subject: string } | null> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('email_templates')
      .select('html_content, subject')
      .eq('type', type)
      .eq('is_default', true)
      .single();

    if (error || !data) {
      return null;
    }

    return { html_content: data.html_content, subject: data.subject };
  } catch (error) {
    console.error('Error fetching template from database:', error);
    return null;
  }
}

export async function getAcceptanceEmailTemplate({ applicantName, jobTitle }: EmailData): Promise<string> {
  // Try to get template from database
  const dbTemplate = await getTemplateFromDatabase('accepted');
  
  let template = dbTemplate?.html_content || DEFAULT_ACCEPTANCE_TEMPLATE;
  
  // Replace placeholders
  return template
    .replace(/{applicantName}/g, applicantName)
    .replace(/{jobTitle}/g, jobTitle)
}

export async function getRejectionEmailTemplate({ applicantName, jobTitle }: EmailData): Promise<string> {
  // Try to get template from database
  const dbTemplate = await getTemplateFromDatabase('rejected');
  
  let template = dbTemplate?.html_content || DEFAULT_REJECTION_TEMPLATE;
  
  // Replace placeholders
  return template
    .replace(/{applicantName}/g, applicantName)
    .replace(/{jobTitle}/g, jobTitle)
}

export async function getEmailTemplateSubject(type: 'accepted' | 'rejected', emailData: EmailData): Promise<string> {
  const dbTemplate = await getTemplateFromDatabase(type);
  
  if (dbTemplate?.subject) {
    return dbTemplate.subject
      .replace(/{applicantName}/g, emailData.applicantName)
      .replace(/{jobTitle}/g, emailData.jobTitle);
  }
  
  // Default subjects
  return type === 'accepted'
    ? `Congratulations! Your application for ${emailData.jobTitle} has been accepted`
    : `Update on your application for ${emailData.jobTitle}`;
}


