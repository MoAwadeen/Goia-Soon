-- Jobs table
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text,
  type text not null,
  description text,
  requirements text,
  salary_range text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Applications table
create table if not exists job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  resume_url text,
  cover_letter text,
  linkedin_url text,
  status text default 'pending',
  submitted_at timestamptz default now()
);

-- Admin users table (links to Supabase Auth users)
create table if not exists admin_users (
  id uuid primary key references auth.users(id),
  email text not null unique,
  role text default 'admin',
  created_at timestamptz default now()
);

-- Enable row level security
alter table jobs enable row level security;
alter table job_applications enable row level security;
alter table admin_users enable row level security;

-- Jobs policies
create policy if not exists "public_read_active_jobs"
on jobs for select
using (is_active = true);

create policy if not exists "admin_manage_jobs"
on jobs for all
using (auth.uid() in (select id from admin_users));

-- Job applications policies
create policy if not exists "public_insert_applications"
on job_applications for insert
with check (true);

create policy if not exists "admin_read_applications"
on job_applications for select
using (auth.uid() in (select id from admin_users));

create policy if not exists "admin_update_applications"
on job_applications for update
using (auth.uid() in (select id from admin_users));

-- Admin users policies
create policy if not exists "admin_self_read"
on admin_users for select
using (auth.uid() = id);

-- Storage policies for resumes bucket
-- Run after creating a private bucket named `resumes`
create policy if not exists "public_can_upload_resumes"
on storage.objects for insert
with check (bucket_id = 'resumes');

create policy if not exists "admins_can_read_resumes"
on storage.objects for select
using (bucket_id = 'resumes' and auth.uid() in (select id from admin_users));


