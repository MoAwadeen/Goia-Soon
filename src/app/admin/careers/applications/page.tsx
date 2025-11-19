import { createClient } from '@/lib/supabase/server'
import ApplicationsTabs from './ApplicationsTabs'
import { Suspense } from 'react'

async function getApplications() {
  const supabase = await createClient()
  if (!supabase) {
    console.warn('Supabase client unavailable. Returning empty applications list.')
    return []
  }
  const { data, error } = await supabase
    .from('job_applications')
    .select('*, jobs(title)')
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('[admin] failed to load applications', error)
    return []
  }

  return data || []
}

export default async function AdminApplicationsPage() {
  const applications = await getApplications()

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-primary/10 bg-white/95 shadow-2xl backdrop-blur-sm p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-primary">Applications Management</h1>
          <p className="text-sm text-muted-foreground">
            Track every candidate from a single dashboard. Review applications and send emails to applicants.
          </p>
        </div>
      </header>

      <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading...</div>}>
        <ApplicationsTabs applications={applications} />
      </Suspense>
    </div>
  )
}

