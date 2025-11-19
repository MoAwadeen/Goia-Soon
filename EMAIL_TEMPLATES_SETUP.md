# Email Templates Database Setup

This document explains how to set up the `email_templates` table in Supabase to store and manage email templates.

## Database Schema

Create the `email_templates` table in your Supabase project:

```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('accepted', 'rejected')),
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_email_templates_type_default ON email_templates(type, is_default) WHERE is_default = true;
CREATE INDEX idx_email_templates_type ON email_templates(type);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Row Level Security (RLS)

Enable RLS and create policies for admin access:

```sql
-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated admin users to read templates
CREATE POLICY "Admin users can read templates"
ON email_templates
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);

-- Policy: Allow authenticated admin users to insert templates
CREATE POLICY "Admin users can insert templates"
ON email_templates
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);

-- Policy: Allow authenticated admin users to update templates
CREATE POLICY "Admin users can update templates"
ON email_templates
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);

-- Policy: Allow authenticated admin users to delete templates
CREATE POLICY "Admin users can delete templates"
ON email_templates
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);
```

## How It Works

1. **Template Storage**: Email templates are stored in the `email_templates` table with the following fields:
   - `name`: A descriptive name for the template
   - `type`: Either 'accepted' or 'rejected'
   - `subject`: The email subject line (supports placeholders: `{applicantName}`, `{jobTitle}`)
   - `html_content`: The HTML email body (supports placeholders: `{applicantName}`, `{jobTitle}`)
   - `is_default`: Boolean flag indicating if this is the default template for its type

2. **Default Templates**: When sending emails, the system looks for templates where `is_default = true` for the appropriate type. Only one template per type should be marked as default.

3. **Template Editor**: The admin interface allows you to:
   - Create new templates
   - Edit existing templates
   - Set a template as default
   - Delete templates
   - Duplicate templates

4. **Email Sending**: When an email is sent:
   - The system fetches the default template for the email type (accepted/rejected)
   - Replaces placeholders (`{applicantName}`, `{jobTitle}`) with actual values
   - Sends the email using the template's subject and HTML content

## Initial Setup

After creating the table, you can optionally create default templates:

```sql
-- Default acceptance template
INSERT INTO email_templates (name, type, subject, html_content, is_default)
VALUES (
  'Default Acceptance Email',
  'accepted',
  'Congratulations! Your application for {jobTitle} has been accepted',
  '<!DOCTYPE html>...', -- Use the default template from the code
  true
);

-- Default rejection template
INSERT INTO email_templates (name, type, subject, html_content, is_default)
VALUES (
  'Default Rejection Email',
  'rejected',
  'Update on your application for {jobTitle}',
  '<!DOCTYPE html>...', -- Use the default template from the code
  true
);
```

## Notes

- The system will fall back to hardcoded default templates if no database template is found
- Only templates marked as `is_default = true` will be used when sending emails
- You can have multiple templates per type, but only one should be default
- Placeholders `{applicantName}` and `{jobTitle}` are automatically replaced when sending emails

