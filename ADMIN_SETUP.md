# Admin Setup Guide for Goia Careers

This guide will help you set up the admin dashboard to manage job postings and applications.

## Prerequisites

- A Supabase project with tables created
- Environment variables configured in `.env.local`
- A Supabase Auth user account

## Step 1: Create Supabase Tables

Run the SQL commands in `supabase/careers_setup.sql` in your Supabase SQL Editor to create the necessary tables:
- `jobs` - stores job postings
- `job_applications` - stores applications
- `admin_users` - links Supabase Auth users to admin permissions

## Step 2: Create Storage Bucket for Resumes

1. Go to **Storage** in your Supabase dashboard
2. Click **Create a new bucket**
3. Name it: `resumes`
4. Set it to **Private**
5. Allowed file types: `application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`

## Step 3: Create Your First Admin User

### Option A: Using Supabase Dashboard

1. Go to **Authentication** in your Supabase dashboard
2. Click **Add User** or **Sign Up** to create a new user
3. Copy the user's UUID (found in the Authentication > Users table)
4. Run this SQL in the SQL Editor:

```sql
INSERT INTO admin_users (id, email, role)
VALUES ('YOUR_USER_UUID_HERE', 'your-email@example.com', 'admin');
```

Replace `YOUR_USER_UUID_HERE` with the actual UUID from step 2.

### Option B: Using Supabase Management API

If you prefer to create admin users programmatically, you can use the Supabase Management API.

## Step 4: Access the Admin Dashboard

1. Make sure your environment variables are set in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

2. Start your development server:
```bash
npm run dev
```

3. Navigate to: `http://localhost:9002/login`
4. Sign in with the email and password you created in Step 3

## Step 5: Create Your First Job Posting

1. After logging in, you'll see the **Jobs Management** dashboard
2. Click **Add New Job**
3. Fill in the job details:
   - Title (required)
   - Type: Full-time, Part-time, Contract, or Intern (required)
   - Location (optional)
   - Salary Range (optional)
   - Job Description (required)
   - Requirements (optional)
   - Check "Publish immediately" to make it visible on the careers page
4. Click **Create Job**

The job will now appear on your public careers page at `/careers` if `is_active` is true.

## Step 6: Review Applications

1. Go to **Applications** in the admin navigation
2. View all applications across all jobs
3. Or go to **Jobs** and click **View** next to a specific job to see applications for that job
4. You can contact applicants via email or download their resumes

## Admin Features Overview

### Jobs Management (`/admin/careers`)
- View all job postings with application counts
- Create new job postings
- Edit existing jobs
- View applications for each job

### Applications (`/admin/applications`)
- View all applications across all jobs
- Filter by job (click "View full application")
- Download resumes
- Contact applicants via email

### Security Features
- Row Level Security (RLS) enabled on all tables
- Only authenticated users in the `admin_users` table can access admin pages
- Public users can only view active jobs and submit applications
- Private storage bucket ensures only admins can view uploaded resumes

## Troubleshooting

### Can't Access Admin Pages
- Check that your user exists in the `admin_users` table
- Verify your Supabase Auth credentials are correct
- Ensure environment variables are set correctly

### Jobs Not Appearing on Careers Page
- Check that `is_active` is set to `true` for the job
- Verify RLS policies are configured correctly
- Ensure the `public_read_active_jobs` policy exists

### Can't View Applications
- Verify you're signed in as an admin
- Check RLS policies for `job_applications` table
- Ensure the `admin_read_applications` policy exists

### Resume Upload Failing
- Verify the `resumes` storage bucket exists
- Check that the bucket is configured with the correct file type restrictions
- Ensure the `public_can_upload_resumes` policy exists
- Check file size (max 5MB)

## Adding More Admin Users

To add additional admin users, simply insert them into the `admin_users` table:

```sql
INSERT INTO admin_users (id, email, role)
VALUES ('ANOTHER_USER_UUID', 'another-email@example.com', 'admin');
```

## Environment Variables Reference

```env
# Public credentials (safe to expose in browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Private key (server-side only, never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Find these values in: Supabase Dashboard → Settings → API

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check server logs for backend errors
3. Verify your Supabase tables and policies match the SQL in `supabase/careers_setup.sql`
4. Ensure your .env.local file is in the project root and not committed to git

