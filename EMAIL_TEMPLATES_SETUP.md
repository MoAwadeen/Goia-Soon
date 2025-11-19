# Email Templates Database Setup

This document explains how to set up the email templates database table in Supabase.

## Database Table Schema

Create a new table called `email_templates` in your Supabase database with the following structure:

### Table: `email_templates`

| Column Name | Type | Default Value | Constraints | Description |
|------------|------|---------------|-------------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | Primary Key | Unique identifier |
| `name` | `text` | - | Not Null | Template name (e.g., "Standard Acceptance Email") |
| `type` | `text` | - | Not Null | Template type: `accepted` or `rejected` |
| `subject` | `text` | - | Not Null | Email subject line (supports placeholders) |
| `html_content` | `text` | - | Not Null | HTML email template content |
| `is_default` | `boolean` | `false` | Not Null | Whether this is the default template for its type |
| `created_at` | `timestamptz` | `now()` | Not Null | Creation timestamp |
| `updated_at` | `timestamptz` | `now()` | Not Null | Last update timestamp |

### SQL to Create Table

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('accepted', 'rejected')),
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_templates_type_default 
ON email_templates(type, is_default) 
WHERE is_default = true;

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON email_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

## Row Level Security (RLS)

Enable RLS and create policies for admin access:

```sql
-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated admin users to read all templates
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

## Placeholders

Email templates support the following placeholders that will be automatically replaced:

- `{applicantName}` - The applicant's full name
- `{jobTitle}` - The job title they applied for

These placeholders work in both the `subject` and `html_content` fields.

## Default Templates

When no default template is set for a type, the system will use hardcoded default templates. To set a template as default:

1. Go to the Email Templates page in the admin panel
2. Edit or create a template
3. Check the "Set as default template" checkbox
4. Save the template

Only one template per type can be set as default at a time. Setting a new template as default will automatically unset the previous default.

## Usage

1. **Create Templates**: Use the "New Template" button in the admin panel
2. **Edit Templates**: Select a template from the list and edit its content
3. **Set Default**: Check "Set as default template" when saving
4. **Delete Templates**: Click the trash icon on any template card

Templates are stored in the database and will persist across deployments.

