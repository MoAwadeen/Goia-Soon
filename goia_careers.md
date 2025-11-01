<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# yes

Great — I’ll use the filename: goia-careers-setup.md

Below is the complete Markdown file content. Copy-paste it into a file named goia-careers-setup.md and provide it to Cursor.

# Goia Careers + Admin (Next.js + Supabase) — Full Implementation Guide

This document is a complete, production-ready implementation guide to add a Careers section to www.goia.app with:

- Public Careers page listing open roles
- Job detail + application submission (with resume upload)
- Admin dashboard to create jobs and review applications
- Supabase database, auth, storage, and RLS policies
- UI aligned with your existing Tailwind branding

Stack:

- Next.js 14 (App Router)
- Supabase (DB, Auth, Storage)
- Tailwind CSS
- react-hook-form + zod
- lucide-react for icons

Notes:

- Keep colors, fonts, spacing consistent with your existing theme. Reuse your Tailwind config and global CSS.

------------------------------------------------------------

## 1) Supabase Setup

### 1.1 Create Tables (SQL)

Run in Supabase SQL Editor:

```sql
-- Jobs
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text,
  type text not null, -- 'Full-time' | 'Part-time' | 'Contract' | 'Intern'
  description text,
  requirements text,
  salary_range text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Applications
create table if not exists job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  resume_url text,
  cover_letter text,
  linkedin_url text,
  status text default 'pending', -- 'pending' | 'reviewing' | 'accepted' | 'rejected'
  submitted_at timestamptz default now()
);

-- Admins (link to Supabase Auth users)
create table if not exists admin_users (
  id uuid primary key references auth.users(id),
  email text not null unique,
  role text default 'admin',
  created_at timestamptz default now()
);
```


### 1.2 Row Level Security (RLS) and Policies

Enable and add policies:

```sql
alter table jobs enable row level security;
alter table job_applications enable row level security;
alter table admin_users enable row level security;

-- Public can read active jobs
create policy "public_read_active_jobs"
on jobs for select
using (is_active = true);

-- Admins can manage jobs
create policy "admin_manage_jobs"
on jobs for all
using (auth.uid() in (select id from admin_users));

-- Anyone can insert applications
create policy "public_insert_applications"
on job_applications for insert
with check (true);

-- Admins can read/update applications
create policy "admin_read_applications"
on job_applications for select
using (auth.uid() in (select id from admin_users));

create policy "admin_update_applications"
on job_applications for update
using (auth.uid() in (select id from admin_users));

-- Admins can view their admin record
create policy "admin_self_read"
on admin_users for select
using (auth.uid() = id);
```


### 1.3 Storage Bucket for Resumes

- Create bucket: resumes
- Public: false
- Allowed types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document

Policies:

```sql
-- Allow anyone to upload a resume object into the resumes bucket
create policy "public_can_upload_resumes"
on storage.objects for insert
with check (bucket_id = 'resumes');

-- Allow admins to read resume files
create policy "admins_can_read_resumes"
on storage.objects for select
using (bucket_id = 'resumes' and auth.uid() in (select id from admin_users));
```

Note: If you want applicants to be able to download their own file by public URL, you can make objects public after upload, or generate signed URLs for admin-only viewing.

------------------------------------------------------------

## 2) Next.js Project Setup

### 2.1 Install dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install react-hook-form @hookform/resolvers zod
npm install lucide-react
```


### 2.2 Environment variables (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Never expose SERVICE_ROLE_KEY to the client; only use on server if needed.

------------------------------------------------------------

## 3) Supabase Client Helpers

Create lib/supabase/client.ts (client-side):

```ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

Create lib/supabase/server.ts (server-side):

```ts
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const createClient = () => {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```


------------------------------------------------------------

## 4) Types

Create lib/types/database.ts:

```ts
export interface Job {
  id: string
  title: string
  location: string | null
  type: string
  description: string | null
  requirements: string | null
  salary_range: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface JobApplication {
  id: string
  job_id: string
  full_name: string
  email: string
  phone: string | null
  resume_url: string | null
  cover_letter: string | null
  linkedin_url: string | null
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected'
  submitted_at: string
}

export interface AdminUser {
  id: string
  email: string
  role: string
  created_at: string
}
```


------------------------------------------------------------

## 5) Careers (Public)

### 5.1 Layout (app/careers/layout.tsx)

```tsx
export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
    </div>
  )
}
```


### 5.2 Jobs List (app/careers/page.tsx)

```tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Briefcase, BriefcaseBusiness } from 'lucide-react'
import type { Job } from '@/lib/types/database'

async function getJobs(): Promise<Job[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) return []
  return data || []
}

export default async function CareersPage() {
  const jobs = await getJobs()

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Join the Goia Team</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Help us build immersive AR museum experiences that delight visitors worldwide.
        </p>
      </div>

      {jobs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/careers/${job.id}`}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                {job.location && (
                  <span className="inline-flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </span>
                )}
                <span className="inline-flex items-center">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {job.type}
                </span>
              </div>
              {job.description && (
                <p className="mt-4 text-gray-600 line-clamp-3">
                  {job.description}
                </p>
              )}
              <div className="mt-4 text-blue-600 font-medium">View details →</div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BriefcaseBusiness className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">No Open Positions</h3>
          <p className="text-gray-600 mt-2">Check back soon or reach out if you'd like to connect.</p>
        </div>
      )}
    </div>
  )
}
```


### 5.3 Job Details + Apply (app/careers/[jobId]/page.tsx)

```tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Job } from '@/lib/types/database'
import { MapPin, Briefcase, DollarSign, Calendar } from 'lucide-react'
import JobApplicationForm from '@/components/JobApplicationForm'

async function getJob(jobId: string): Promise<Job | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .eq('is_active', true)
    .single()
  if (error) return null
  return data
}

export default async function JobDetailsPage({ params }: { params: { jobId: string } }) {
  const job = await getJob(params.jobId)
  if (!job) notFound()

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-gray-600">
          {job.location && (
            <span className="inline-flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              {job.location}
            </span>
          )}
          <span className="inline-flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            {job.type}
          </span>
          {job.salary_range && (
            <span className="inline-flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              {job.salary_range}
            </span>
          )}
          <span className="inline-flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Posted {new Date(job.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {job.description && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Job Description</h2>
              <div className="prose max-w-none">
                {job.description.split('\n').map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          )}

          {job.requirements && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Requirements</h2>
              <div className="prose max-w-none">
                {job.requirements.split('\n').map((r, i) => (
                  <p key={i}>{r}</p>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="bg-gray-50 rounded-xl p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply for this position</h3>
            <JobApplicationForm jobId={job.id} />
          </div>
        </aside>
      </div>
    </div>
  )
}
```


### 5.4 Application Form Component (components/JobApplicationForm.tsx)

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react'

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  linkedinUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  coverLetter: z.string().min(10, 'Please add a brief cover letter'),
  resume: z
    .instanceof(FileList)
    .refine((f) => f.length > 0, 'Resume is required')
    .refine((f) => f[0]?.size <= 5 * 1024 * 1024, 'Max 5MB')
    .refine(
      (f) =>
        ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(
          f[0]?.type
        ),
      'PDF or Word only'
    ),
})

type FormValues = z.infer<typeof schema>

export default function JobApplicationForm({ jobId }: { jobId: string }) {
  const supabase = createClient()
  const [state, setState] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    setState('idle')
    try {
      const file = values.resume[0]
      const ext = file.name.split('.').pop()
      const safeName = values.fullName.replace(/\s+/g, '_')
      const path = `${safeName}_${Date.now()}.${ext}`

      const { error: upErr } = await supabase.storage.from('resumes').upload(path, file)
      if (upErr) throw upErr

      const { data: urlData } = await supabase.storage.from('resumes').getPublicUrl(path)
      const resumeUrl = urlData.publicUrl

      const { error: insErr } = await supabase.from('job_applications').insert({
        job_id: jobId,
        full_name: values.fullName,
        email: values.email,
        phone: values.phone || null,
        linkedin_url: values.linkedinUrl || null,
        cover_letter: values.coverLetter,
        resume_url: resumeUrl,
      })
      if (insErr) throw insErr

      setState('success')
      reset()
    } catch (e) {
      console.error(e)
      setState('error')
    } finally {
      setSubmitting(false)
    }
  }

  if (state === 'success') {
    return (
      <div className="text-center py-6">
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
        <p className="text-gray-800 font-medium">Application submitted!</p>
        <p className="text-sm text-gray-600">We will review and get back to you.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Full Name *</label>
        <input
          {...register('fullName')}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="John Doe"
        />
        {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email *</label>
        <input
          {...register('email')}
          type="email"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="john@example.com"
        />
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input
          {...register('phone')}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="+20 ..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">LinkedIn</label>
        <input
          {...register('linkedinUrl')}
          type="url"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="https://linkedin.com/in/..."
        />
        {errors.linkedinUrl && <p className="text-xs text-red-600 mt-1">{errors.linkedinUrl.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Resume (PDF/DOC, max 5MB) *</label>
        <div className="relative">
          <input
            {...register('resume')}
            type="file"
            accept=".pdf,.doc,.docx"
            className="w-full border border-gray-300 rounded-md px-3 py-2 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
          />
          <Upload className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
        </div>
        {errors.resume && <p className="text-xs text-red-600 mt-1">{errors.resume.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Cover Letter *</label>
        <textarea
          {...register('coverLetter')}
          rows={4}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="Tell us why you'd be a great fit..."
        />
        {errors.coverLetter && <p className="text-xs text-red-600 mt-1">{errors.coverLetter.message}</p>}
      </div>

      {state === 'error' && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-2" />
          Failed to submit. Please try again.
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Application'
        )}
      </button>
    </form>
  )
}
```


------------------------------------------------------------

## 6) Admin Access and Nav

### 6.1 Admin Layout Guard (app/admin/layout.tsx)

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNavigation from '@/components/AdminNavigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/admin/login')

  const { data: admin } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', session.user.id)
    .single()
  if (!admin) redirect('/admin/unauthorized')

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation userEmail={session.user.email!} />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
```


### 6.2 Admin Topbar (components/AdminNavigation.tsx)

```tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Briefcase, Users } from 'lucide-react'

export default function AdminNavigation({ userEmail }: { userEmail: string }) {
  const supabase = createClient()
  const router = useRouter()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/admin/careers" className="text-xl font-semibold text-gray-900">
          Goia Admin
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/admin/careers" className="inline-flex items-center text-gray-700 hover:text-blue-600">
            <Briefcase className="w-4 h-4 mr-2" />
            Jobs
          </Link>
          <Link href="/admin/applications" className="inline-flex items-center text-gray-700 hover:text-blue-600">
            <Users className="w-4 h-4 mr-2" />
            Applications
          </Link>
          <div className="text-sm text-gray-600">{userEmail}</div>
          <button onClick={signOut} className="inline-flex items-center text-gray-700 hover:text-red-600">
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
```


### 6.3 Admin Login (app/admin/login/page.tsx)

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const { data: admin, error: adminErr } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', data.user.id)
        .single()
      if (adminErr || !admin) throw new Error('Unauthorized')
      router.push('/admin/careers')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={submit} className="bg-white w-full max-w-md rounded-xl p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Sign In</h1>
        <p className="text-sm text-gray-600 mb-6">Access the Goia careers admin panel</p>

        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
          type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
        />

        <label className="block text-sm font-medium mb-1">Password</label>
        <div className="relative mb-4">
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
            type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
          />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-2.5 text-gray-500">
            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</> : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
```


### 6.4 Unauthorized Page (app/admin/unauthorized/page.tsx)

```tsx
export default function Unauthorized() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Unauthorized</h1>
        <p className="text-gray-600 mt-2">You do not have access to this area.</p>
      </div>
    </div>
  )
}
```


------------------------------------------------------------

## 7) Admin: Jobs CRUD and Applications

### 7.1 Jobs Overview (app/admin/careers/page.tsx)

```tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Briefcase, ToggleRight, ToggleLeft, Plus, Eye, Edit3 } from 'lucide-react'

async function getJobs() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('jobs')
    .select('*, job_applications(count)')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function AdminCareersPage() {
  const jobs = await getJobs()
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs Management</h1>
          <p className="text-gray-600">Create and manage job postings</p>
        </div>
        <Link href="/admin/careers/new" className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Job
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Job</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Applications</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Created</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.map((job: any) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{job.title}</div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                      {job.location && <span className="inline-flex items-center"><MapPin className="w-3 h-3 mr-1" />{job.location}</span>}
                      <span className="inline-flex items-center"><Briefcase className="w-3 h-3 mr-1" />{job.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                      job.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.is_active ? <><ToggleRight className="w-3 h-3 mr-1" />Active</> : <><ToggleLeft className="w-3 h-3 mr-1" />Inactive</>}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/careers/${job.id}/applications`} className="text-blue-600 hover:text-blue-800">
                      {job.job_applications?.[0]?.count || 0} applications
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{new Date(job.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/careers/${job.id}/applications`} className="inline-flex items-center text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Link>
                      <Link href={`/admin/careers/${job.id}/edit`} className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
                        <Edit3 className="w-4 h-4 mr-1" /> Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-600">No jobs posted yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```


### 7.2 Create Job (app/admin/careers/new/page.tsx)

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  location: z.string().optional(),
  type: z.enum(['Full-time', 'Part-time', 'Contract', 'Intern']),
  description: z.string().min(10, 'Description required'),
  requirements: z.string().optional(),
  salary_range: z.string().optional(),
  is_active: z.boolean().default(true),
})

type FormValues = z.infer<typeof schema>

export default function NewJobPage() {
  const supabase = createClient()
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true },
  })

  const onSubmit = async (values: FormValues) => {
    const { error } = await supabase.from('jobs').insert(values)
    if (error) {
      alert('Failed to create job')
      return
    }
    router.push('/admin/careers')
    router.refresh()
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/careers" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">Create New Job</h1>
        <p className="text-gray-600">Add a new posting to the careers page</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Job Title *</label>
            <input {...register('title')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Job Type *</label>
            <select {...register('type')} className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">Select type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Intern">Intern</option>
            </select>
            {errors.type && <p className="text-xs text-red-600 mt-1">{errors.type.message}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input {...register('location')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Salary Range</label>
            <input {...register('salary_range')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Job Description *</label>
          <textarea {...register('description')} rows={8} className="w-full border border-gray-300 rounded-md px-3 py-2" />
          {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Requirements</label>
          <textarea {...register('requirements')} rows={6} className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>

        <div className="flex items-center">
          <input type="checkbox" {...register('is_active')} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
          <span className="ml-2 text-sm text-gray-700">Publish immediately</span>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/careers" className="px-4 py-2 border border-gray-300 rounded-md">Cancel</Link>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center">
            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : <><Save className="w-4 h-4 mr-2" />Create Job</>}
          </button>
        </div>
      </form>
    </div>
  )
}
```


### 7.3 View Applications (app/admin/careers/[jobId]/applications/page.tsx)

```tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, User, Clock, Mail, Phone, Linkedin, Download } from 'lucide-react'
import type { Job, JobApplication } from '@/lib/types/database'

async function getData(jobId: string) {
  const supabase = createClient()
  const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).single()
  if (!job) return null
  const { data: applications } = await supabase
    .from('job_applications')
    .select('*')
    .eq('job_id', jobId)
    .order('submitted_at', { ascending: false })
  return { job, applications: applications || [] }
}

export default async function JobApplicationsPage({ params }: { params: { jobId: string } }) {
  const result = await getData(params.jobId)
  if (!result) notFound()
  const { job, applications } = result as { job: Job; applications: JobApplication[] }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/careers" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">{job.title}</h1>
        <p className="text-gray-600">{applications.length} application{applications.length !== 1 ? 's' : ''}</p>
      </div>

      {applications.length ? (
        <div className="space-y-6">
          {applications.map((a) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{a.full_name}</div>
                    <div className="text-sm text-gray-600 inline-flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Applied {new Date(a.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="text-gray-700 inline-flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <a className="text-blue-600 hover:underline" href={`mailto:${a.email}`}>{a.email}</a>
                  </div>
                  {a.phone && (
                    <div className="text-gray-700 inline-flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      <a className="text-blue-600 hover:underline" href={`tel:${a.phone}`}>{a.phone}</a>
                    </div>
                  )}
                  {a.linkedin_url && (
                    <div className="text-gray-700 inline-flex items-center">
                      <Linkedin className="w-4 h-4 mr-2" />
                      <a className="text-blue-600 hover:underline" href={a.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a>
                    </div>
                  )}
                  {a.resume_url && (
                    <div className="text-gray-700 inline-flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      <a className="text-blue-600 hover:underline" href={a.resume_url} target="_blank" rel="noreferrer">Download Resume</a>
                    </div>
                  )}
                </div>

                {a.cover_letter && (
                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-2">Cover Letter</div>
                    <div className="bg-gray-50 rounded-md p-4">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{a.cover_letter}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-600">
          No applications yet.
        </div>
      )}
    </div>
  )
}
```


------------------------------------------------------------

## 8) First Admin User

Create an admin user in Supabase Auth, copy their user id, then:

```sql
insert into admin_users (id, email, role)
values ('<AUTH_USER_ID>', '<ADMIN_EMAIL>', 'admin');
```


------------------------------------------------------------

## 9) Navigation Link (Public Site)

Add a link to Careers in your site navbar:

```tsx
<Link href="/careers" className="your-nav-link-classes">Careers</Link>
```


------------------------------------------------------------

## 10) Branding \& Theming

- Use your existing Tailwind config and globals:
- Ensure components use your brand color (e.g., primary buttons bg-blue-600 → swap to your brand primary)
- Typography should follow your font setup
- Adjust spacing and radii to match your existing cards and sections

If you want Cursor to strictly match styling, paste your Tailwind config and globals.css in the prompt and ask it to reuse tokens and classes.

------------------------------------------------------------

## 11) Optional Enhancements

- Email notification on new application (Edge Function or webhook → send email)
- Signed URLs for resumes instead of public URLs
- Status management for applications (update from admin UI)
- CSV export of applications
- Pagination and filters on admin list
- Rich text editor for job descriptions

------------------------------------------------------------

## 12) Test Plan

- Visit /careers → see list of active jobs
- Open a job → submit application with PDF
- In Supabase Storage → file appears in resumes
- In DB → job_applications row created
- Visit /admin/login → sign in with admin user
- /admin/careers → see jobs, counts
- /admin/careers/[jobId]/applications → see application details, links work

------------------------------------------------------------

End of file.

