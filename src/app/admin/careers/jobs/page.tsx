import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Briefcase, ToggleRight, ToggleLeft, Plus, Eye, Edit3, Calendar, Users } from 'lucide-react'

async function getJobs() {
  const supabase = await createClient()
  if (!supabase) {
    console.warn('Supabase client unavailable. Returning empty admin jobs list.')
    return []
  }
  const { data, error } = await supabase
    .from('jobs')
    .select('*, job_applications(count)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin] failed to load jobs', error)
    return []
  }

  return data || []
}

export default async function AdminCareersPage() {
  const jobs = await getJobs()

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-primary">Jobs management</h1>
          <p className="text-sm text-muted-foreground">
            Publish new opportunities, pause roles, and keep track of how many people have applied.
          </p>
        </div>
        <Link
          href="/admin/careers/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Add new job
        </Link>
      </div>

      {jobs.length ? (
        <div className="grid gap-5">
          {jobs.map((job: any) => {
            const applicationCount = job.job_applications?.[0]?.count || 0
            const statusClasses = job.is_active
              ? 'inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary'
              : 'inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground'

            return (
              <div
                key={job.id}
                className="rounded-3xl border border-primary/10 bg-white/95 shadow-lg backdrop-blur-sm p-6 transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold text-primary">{job.title}</h2>
                      <span className={statusClasses}>
                        {job.is_active ? (
                          <>
                            <ToggleRight className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-3 h-3" /> Inactive
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {job.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                      <Users className="w-4 h-4" />
                      {applicationCount} application{applicationCount !== 1 ? 's' : ''}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/admin/careers/${job.id}/applications`}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
                  >
                    <Eye className="w-4 h-4" />
                    View applications
                  </Link>
                  <Link
                    href={`/admin/careers/${job.id}/edit`}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-4 py-2 text-sm font-medium text-primary transition hover:border-primary hover:bg-primary/5"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit job
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-primary/20 bg-white/95 shadow-lg backdrop-blur-sm p-16 text-center text-muted-foreground">
          No jobs posted yet. Create your first role to start receiving applications.
        </div>
      )}
    </div>
  )
}

