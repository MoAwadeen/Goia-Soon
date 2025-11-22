# Goia - Coming Soon

A modern, responsive landing page with integrated careers platform for Goia's upcoming US launch.

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Environment Setup](#-environment-setup)
- [Supabase Setup](#-supabase-setup)
- [Admin Setup](#-admin-setup)
- [Email Templates](#-email-templates)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/goia-soon.git
   cd goia-soon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the project root:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # Resend (Email Service)
   RESEND_API_KEY=re_your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:9002](http://localhost:9002)

### Available Scripts

```bash
npm run dev          # Development server (port 9002 with Turbopack)
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

---

## 🎯 Features

- ✅ **Landing Page**: Coming soon page with email signup for early adopters
- ✅ **Careers Platform**: Public job listings with application system
- ✅ **Admin Dashboard**: Job management and application review
- ✅ **Resume Upload**: Secure file storage with Supabase Storage
- ✅ **Email System**: Automated acceptance/rejection emails via Resend
- ✅ **Authentication**: Supabase Auth with admin role protection
- ✅ **Analytics**: Vercel Analytics integration
- ✅ **Responsive Design**: Mobile-first with Tailwind CSS
- ✅ **Security**: Row Level Security (RLS) policies
- ✅ **Performance**: Optimized images and compression

---

## 🛠️ Tech Stack

### Core Technologies
- **Framework**: Next.js 15.5.6 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.1
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Email**: Resend API
- **Analytics**: Vercel Analytics
- **Deployment**: Vercel

### Key Dependencies
- **UI Components**: Radix UI (shadcn/ui pattern)
- **Forms**: react-hook-form + zod validation
- **Icons**: lucide-react
- **Date Handling**: date-fns
- **AI Integration**: Google Genkit

---

## 📁 Project Structure

```
Goia-Soon/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Landing page
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Global styles
│   │   ├── careers/                  # Public careers section
│   │   │   ├── page.tsx              # Jobs listing
│   │   │   └── [jobId]/              # Job details + application
│   │   ├── admin/                    # Admin dashboard
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   ├── layout.tsx            # Auth guard
│   │   │   └── careers/              # Job & application management
│   │   ├── login/                    # Admin login
│   │   └── api/                      # API routes
│   ├── components/
│   │   ├── landing/                  # Landing page components
│   │   ├── ui/                       # Reusable UI components
│   │   ├── AdminNavigation.tsx       # Admin nav bar
│   │   ├── JobApplicationForm.tsx    # Application form
│   │   └── ApplicationStatusUpdater.tsx
│   ├── lib/
│   │   ├── supabase/                 # Supabase clients
│   │   ├── types/                    # TypeScript types
│   │   ├── email-templates.ts        # Email HTML templates
│   │   └── resend.ts                 # Email client
│   └── hooks/                        # Custom React hooks
├── supabase/
│   └── careers_setup.sql             # Database schema
├── .env.local                        # Environment variables
├── next.config.ts                    # Next.js config
├── tailwind.config.ts                # Tailwind config
└── vercel.json                       # Vercel deployment config
```

---

## 🔧 Environment Setup

### Required Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend Configuration (for email sending)
RESEND_API_KEY=re_your_api_key_here
```

**Security Notes:**
- `NEXT_PUBLIC_*` variables are safe to expose in the browser
- `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to the client
- Only use service role key in server-side API routes

### Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Navigate to **Settings** > **API**
3. Copy:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)
   - **service_role** key (starts with `eyJ`)

### Setup Resend

1. Sign up at [resend.com](https://resend.com)
2. Create an API key in the Resend dashboard
3. Verify your domain `goia.app` to send from `careers@goia.app`

---

## 🗄️ Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: `goia-email-collector`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest to your users
4. Wait for setup (2-3 minutes)

### 2. Create Database Tables

Run the SQL from `supabase/careers_setup.sql` in your Supabase SQL Editor:

```sql
-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT,
  type TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  salary_range TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  linkedin_url TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Early adopters table (for landing page email signup)
CREATE TABLE IF NOT EXISTS early_adopters (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3. Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE early_adopters ENABLE ROW LEVEL SECURITY;

-- Jobs policies
CREATE POLICY "public_read_active_jobs"
ON jobs FOR SELECT
USING (is_active = true);

CREATE POLICY "admin_manage_jobs"
ON jobs FOR ALL
USING (auth.uid() IN (SELECT id FROM admin_users));

-- Job applications policies
CREATE POLICY "public_insert_applications"
ON job_applications FOR INSERT
WITH CHECK (true);

CREATE POLICY "admin_read_applications"
ON job_applications FOR SELECT
USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "admin_update_applications"
ON job_applications FOR UPDATE
USING (auth.uid() IN (SELECT id FROM admin_users));

-- Admin users policies
CREATE POLICY "admin_self_read"
ON admin_users FOR SELECT
USING (auth.uid() = id);

-- Early adopters policy
CREATE POLICY "Allow public inserts"
ON early_adopters FOR INSERT
TO public
WITH CHECK (true);
```

### 4. Create Storage Bucket for Resumes

1. Go to **Storage** in your Supabase dashboard
2. Click **Create a new bucket**
3. Configure:
   - **Name**: `resumes`
   - **Public**: false (Private)
   - **Allowed file types**: `application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`

4. Add storage policies:

```sql
-- Allow anyone to upload resumes
CREATE POLICY "public_can_upload_resumes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resumes');

-- Allow admins to read resumes
CREATE POLICY "admins_can_read_resumes"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes' AND auth.uid() IN (SELECT id FROM admin_users));
```

### 5. Test the Integration

1. Start your dev server: `npm run dev`
2. Go to the landing page
3. Enter an email in the signup form
4. Check Supabase dashboard → **Table Editor** → `early_adopters`
5. You should see the new email entry

---

## 👨‍💼 Admin Setup

### 1. Create Your First Admin User

#### Option A: Using Supabase Dashboard

1. Go to **Authentication** in your Supabase dashboard
2. Click **Add User** to create a new user
3. Copy the user's UUID from the Users table
4. Run this SQL in the SQL Editor:

```sql
INSERT INTO admin_users (id, email, role)
VALUES ('YOUR_USER_UUID_HERE', 'your-email@example.com', 'admin');
```

Replace `YOUR_USER_UUID_HERE` with the actual UUID.

#### Option B: Programmatically

Use the Supabase Management API to create admin users programmatically.

### 2. Access the Admin Dashboard

1. Ensure environment variables are set in `.env.local`
2. Start your development server: `npm run dev`
3. Navigate to: `http://localhost:9002/login`
4. Sign in with your admin credentials

### 3. Create Your First Job Posting

1. After logging in, go to the **Jobs Management** dashboard
2. Click **Add New Job**
3. Fill in the job details:
   - Title (required)
   - Type: Full-time, Part-time, Contract, or Intern (required)
   - Location (optional)
   - Salary Range (optional)
   - Job Description (required)
   - Requirements (optional)
   - Check "Publish immediately" to make it visible
4. Click **Create Job**

The job will appear on `/careers` if `is_active` is true.

### 4. Review Applications

1. Go to **Applications** in the admin navigation
2. View all applications across all jobs
3. Update application status (pending → reviewing → accepted/rejected)
4. Download resumes
5. Send acceptance/rejection emails

### Admin Features Overview

#### Jobs Management (`/admin/careers/jobs`)
- View all job postings with application counts
- Create new job postings
- Edit existing jobs
- Toggle active/inactive status
- Delete jobs

#### Applications (`/admin/careers/applications`)
- View all applications
- Filter by job
- Update application status
- Download resumes
- Send emails to applicants

#### Email Management
- Send acceptance emails
- Send rejection emails
- Manage email templates

### Adding More Admin Users

```sql
INSERT INTO admin_users (id, email, role)
VALUES ('ANOTHER_USER_UUID', 'another-email@example.com', 'admin');
```

---

## 📧 Email Templates

### Database Schema (Optional)

You can optionally create an `email_templates` table to manage templates in the database:

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

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admin users can manage templates"
ON email_templates FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT id FROM admin_users));
```

### Template Variables

Email templates support the following placeholders:
- `{applicantName}` - Replaced with the applicant's full name
- `{jobTitle}` - Replaced with the job title

### Default Templates

The system includes hardcoded default templates for:
- **Acceptance Email**: Congratulations message with Goia branding
- **Rejection Email**: Professional rejection with encouragement

Templates use Goia brand colors (#E10112) and are fully responsive.

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

#### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/goia-soon)

#### Option 2: Vercel Dashboard

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Configure:
     - Framework: Next.js (auto-detected)
     - Build Command: `npm run build`
     - Output Directory: `.next`
   - Add environment variables
   - Click "Deploy"

#### Option 3: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### Environment Variables on Vercel

Add these in your Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your_api_key_here
```

### Custom Domain

1. In Vercel Dashboard → Project Settings → Domains
2. Add your custom domain (e.g., `goia.app`)
3. Configure DNS records as provided by Vercel
4. Wait for DNS propagation (up to 48 hours)

### Performance Optimizations

Already configured:
- ✅ Image optimization for Google Drive
- ✅ Compression enabled
- ✅ Security headers
- ✅ Console removal in production
- ✅ Static generation
- ✅ Vercel Analytics

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Supabase Connection Errors

**Error**: "Invalid API key" or "Connection failed"

**Solutions**:
- Check environment variables are set correctly
- Verify you're using the right keys (anon vs service role)
- Ensure `.env.local` is in the project root
- Restart the dev server after changing env vars

#### 2. Row Level Security Errors

**Error**: "Row Level Security policy violation"

**Solutions**:
- Ensure RLS is enabled on all tables
- Verify policies are created correctly
- Check that admin user exists in `admin_users` table
- Run the complete SQL from `supabase/careers_setup.sql`

#### 3. Admin Access Issues

**Error**: Can't access admin pages or redirected to login

**Solutions**:
- Verify user exists in `admin_users` table
- Check Supabase Auth credentials
- Ensure environment variables are correct
- Clear browser cookies and try again

#### 4. Jobs Not Appearing on Careers Page

**Solutions**:
- Check `is_active` is set to `true` for the job
- Verify RLS policy `public_read_active_jobs` exists
- Check browser console for errors
- Verify Supabase connection is working

#### 5. Resume Upload Failing

**Error**: Upload fails or file not accessible

**Solutions**:
- Verify `resumes` storage bucket exists
- Check bucket is set to **Private**
- Ensure storage policies are created
- Verify file size is under 5MB
- Check file type is PDF, DOC, or DOCX

#### 6. Email Sending Issues

**Error**: Emails not being sent

**Solutions**:
- Verify `RESEND_API_KEY` is set correctly
- Check domain is verified in Resend dashboard
- Ensure sender email is `careers@goia.app`
- Check Resend dashboard for error logs

#### 7. Build Errors

**Solutions**:
- Run `npm run typecheck` to find TypeScript errors
- Ensure all dependencies are installed
- Check Next.js configuration
- Review build logs in Vercel dashboard

### Development Tips

1. **Check Logs**: Always check browser console and server logs
2. **Test Supabase**: Use `/api/test-supabase` endpoint to verify connection
3. **Environment Variables**: Never commit `.env.local` to git
4. **Database**: Use Supabase SQL Editor to verify data
5. **Email Testing**: Test emails in development before production

### Getting Help

If you encounter issues:
1. Check this troubleshooting section
2. Review Supabase dashboard logs
3. Check Vercel deployment logs
4. Contact: youssef.talaat@goia.app

---

## 📊 Database Schema Reference

### Tables Overview

#### `jobs`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | Job title (required) |
| location | text | Job location |
| type | text | Full-time, Part-time, Contract, Intern |
| description | text | Job description |
| requirements | text | Job requirements |
| salary_range | text | Salary range |
| is_active | boolean | Published status |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Update timestamp |

#### `job_applications`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| job_id | uuid | Foreign key to jobs |
| full_name | text | Applicant name |
| email | text | Applicant email |
| phone | text | Phone number |
| resume_url | text | Resume file URL |
| cover_letter | text | Cover letter |
| linkedin_url | text | LinkedIn profile |
| status | text | pending, reviewing, accepted, rejected |
| submitted_at | timestamptz | Submission timestamp |

#### `admin_users`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (references auth.users) |
| email | text | Admin email (unique) |
| role | text | Admin role |
| created_at | timestamptz | Creation timestamp |

#### `early_adopters`
| Column | Type | Description |
|--------|------|-------------|
| id | int8 | Primary key (auto-increment) |
| email | text | Subscriber email (unique) |
| subscribed_at | timestamptz | Subscription timestamp |
| status | text | active, inactive |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Update timestamp |

---

## 🎨 Design System

### Colors
- **Primary**: Red (#E10112) - Goia brand color
- **Background**: Light with gradients
- **Cards**: White with transparency (bg-white/95)
- **Borders**: Subtle (border-primary/10)

### Typography
- **Font**: Quicksand (Google Fonts)
- **Weight**: 700 for headlines

### UI Patterns
- Rounded corners (rounded-3xl)
- Glassmorphism with backdrop blur
- Smooth animations
- Hover effects

---

## 📞 Support

For questions or support, contact: **youssef.talaat@goia.app**

### Company Links
- **LinkedIn**: [linkedin.com/company/goiaapp](https://www.linkedin.com/company/goiaapp/)
- **Instagram**: [@goia.app](https://www.instagram.com/goia.app)
- **Facebook**: [Goia Official](https://www.facebook.com/profile.php?id=61563305546037)

---

## 📄 License

Copyright © 2024 Goia. All rights reserved.
