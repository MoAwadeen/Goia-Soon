import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, User, Clock, Mail, Phone, Linkedin, Eye, FileText } from 'lucide-react'
import type { Job, JobApplication } from '@/lib/types/database'

async function getData(jobId: string) {
  const supabase = await createClient()
  if (!supabase) {
    console.warn('Supabase client unavailable. Unable to load job applications.')
    return null
  }
  const { data: job, error: jobError } = await supabase.from('jobs').select('*').eq('id', jobId).single()

  if (jobError || !job) {
    return null
  }

  const { data: applications, error: applicationsError } = await supabase
    .from('job_applications')
    .select('*')
    .eq('job_id', jobId)
    .order('submitted_at', { ascending: false })

  if (applicationsError) {
    console.error('[admin] failed to load job applications', applicationsError)
    return { job, applications: [] as JobApplication[] }
  }

  return { job, applications: applications || [] }
}

export default async function JobApplicationsPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  const result = await getData(jobId)

  if (!result) {
    notFound()
  }

  const { job, applications } = result as { job: Job; applications: JobApplication[] }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Link href="/admin/careers" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to jobs
          </Link>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">{job.title}</h1>
            <p className="text-sm text-muted-foreground">
              {applications.length} application{applications.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <FileText className="w-4 h-4" /> Review each application carefully before updating statuses in Supabase.
        </div>
      </div>

      {applications.length ? (
        <div className="grid gap-6">
          {applications.map((application) => (
            <div key={application.id} className="rounded-3xl border border-primary/10 bg-white/90 shadow-lg backdrop-blur-sm p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 text-primary p-3">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-foreground">{application.full_name}</div>
                    <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Applied {new Date(application.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {application.resume_url && (
                  <Link
                    href={`/admin/resume?url=${encodeURIComponent(application.resume_url)}`}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
                    target="_blank"
                  >
                    <Eye className="w-4 h-4" /> View resume
                  </Link>
                )}
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <a className="text-primary hover:underline" href={`mailto:${application.email}`}>
                      {application.email}
                    </a>
                  </div>
                  {application.phone && (
                    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <a className="text-primary hover:underline" href={`tel:${application.phone}`}>
                        {application.phone}
                      </a>
                    </div>
                  )}
                  {application.linkedin_url && (
                    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Linkedin className="w-4 h-4" />
                      <a
                        className="text-primary hover:underline"
                        href={application.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        LinkedIn profile
                      </a>
                    </div>
                  )}
                </div>

                {application.cover_letter && (
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <div className="text-sm font-semibold text-primary mb-2">Cover letter</div>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                      {application.cover_letter}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-primary/20 bg-white/80 p-16 text-center text-muted-foreground">
          No applications yet.
        </div>
      )}
    </div>
  )
}
