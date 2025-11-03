import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, FileText } from 'lucide-react'
import type { Job, JobApplication } from '@/lib/types/database'
import ApplicationsView from './ApplicationsView'

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

  // Generate signed URLs for resumes
  const applicationsWithUrls = await Promise.all(
    (applications || []).map(async (app) => {
      if (app.resume_url) {
        const { data } = await supabase.storage
          .from('resumes')
          .createSignedUrl(app.resume_url, 3600) // URL valid for 1 hour
        return { ...app, resume_download_url: data?.signedUrl || null }
      }
      return { ...app, resume_download_url: null }
    })
  )

  return { job, applications: applicationsWithUrls }
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
          <Link href="/admin/careers/jobs" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium">
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
          <FileText className="w-4 h-4" /> Review applications and update their status
        </div>
      </div>

      <Suspense fallback={
        <div className="rounded-3xl border border-primary/10 bg-white/90 shadow-lg backdrop-blur-sm p-6 animate-pulse">
          <div className="h-32 bg-muted/20 rounded-2xl"></div>
        </div>
      }>
        <ApplicationsView applications={applications} />
      </Suspense>
    </div>
  )
}
