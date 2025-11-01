import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Job } from '@/lib/types/database'
import { MapPin, Briefcase, DollarSign, Calendar } from 'lucide-react'
import JobApplicationForm from '@/components/JobApplicationForm'

async function getJob(jobId: string): Promise<Job | null> {
  const supabase = await createClient()
  if (!supabase) {
    console.warn('Supabase client unavailable. Unable to fetch job details.')
    return null
  }
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('[careers] failed to load job', error)
    return null
  }

  return data
}

export default async function JobDetailsPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  const job = await getJob(jobId)

  if (!job) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-primary/10 bg-white/90 px-6 py-10 shadow-lg backdrop-blur-sm">
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold text-foreground">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {job.location && (
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {job.location}
              </span>
            )}
            <span className="inline-flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {job.type}
            </span>
            {job.salary_range && (
              <span className="inline-flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                {job.salary_range}
              </span>
            )}
            <span className="inline-flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Posted {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-8">
          {job.description && (
            <section className="rounded-3xl border border-primary/10 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-foreground mb-3">Job description</h2>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          )}

          {job.requirements && (
            <section className="rounded-3xl border border-primary/10 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-foreground mb-3">Requirements</h2>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                {job.requirements.split('\n').map((requirement, index) => (
                  <p key={index}>{requirement}</p>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-8">
          <div className="rounded-3xl border border-primary/10 bg-white/95 p-6 shadow-lg backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Apply for this position</h3>
            <JobApplicationForm jobId={job.id} />
          </div>
        </aside>
      </div>
    </div>
  )
}
