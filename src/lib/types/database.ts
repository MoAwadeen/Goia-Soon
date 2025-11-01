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


