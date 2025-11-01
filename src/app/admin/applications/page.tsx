import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Briefcase, User, Eye, ArrowRight } from 'lucide-react'

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
      <header className="rounded-3xl border border-primary/10 bg-white/90 shadow-lg backdrop-blur-sm p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-foreground">Applications overview</h1>
          <p className="text-sm text-muted-foreground">
            Track every candidate from a single dashboard. Follow up directly or drill into a specific job for more context.
          </p>
        </div>
      </header>

      {applications.length ? (
        <div className="grid gap-5">
          {applications.map((application: any) => (
            <div
              key={application.id}
              className="rounded-3xl border border-primary/10 bg-white/90 shadow-md backdrop-blur-sm p-5 transition hover:shadow-lg"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 text-primary p-3">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-foreground">{application.full_name}</div>
                    <div className="text-sm text-muted-foreground">{application.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {application.jobs?.title ?? 'Job removed'}
                  </span>
                  <span>{new Date(application.submitted_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={`mailto:${application.email}`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/15"
                >
                  Contact applicant
                </Link>
                <Link
                  href={`/admin/careers/${application.job_id}/applications`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  <Eye className="w-4 h-4" />
                  View full application
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-primary/20 bg-white/80 p-16 text-center text-muted-foreground">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ArrowRight className="w-5 h-5" />
          </div>
          No applications yet. Once candidates submit from the careers page, they will appear here.
        </div>
      )}
    </div>
  )
}
