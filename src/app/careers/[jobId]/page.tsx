import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Job } from '@/lib/types/database'
import { MapPin, Briefcase, DollarSign, Calendar, ArrowLeft } from 'lucide-react'
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
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <Link
        href="/careers"
        className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-primary shadow-lg backdrop-blur-sm transition hover:bg-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all jobs
      </Link>

      <header className="rounded-3xl border border-primary/10 bg-white/95 px-8 py-12 shadow-2xl backdrop-blur-sm">
        <div className="space-y-5">
          <h1 className="text-4xl font-bold text-primary drop-shadow-sm md:text-5xl">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {job.location && (
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1.5">
                <MapPin className="w-4 h-4" />
                {job.location}
              </span>
            )}
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1.5">
              <Briefcase className="w-4 h-4" />
              {job.type}
            </span>
            {job.salary_range && (
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1.5">
                <DollarSign className="w-4 h-4" />
                {job.salary_range}
              </span>
            )}
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1.5">
              <Calendar className="w-4 h-4" />
              Posted {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {job.description && (
            <section className="rounded-3xl border border-primary/10 bg-white/95 p-8 shadow-lg backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-primary mb-4">Job description</h2>
              <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          )}

          {job.requirements && (
            <section className="rounded-3xl border border-primary/10 bg-white/95 p-8 shadow-lg backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-primary mb-4">Requirements</h2>
              <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
                {job.requirements.split('\n').map((requirement, index) => (
                  <p key={index}>{requirement}</p>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-3xl border border-primary/10 bg-white/95 p-7 shadow-2xl backdrop-blur-sm">
            <h3 className="text-xl font-bold text-primary mb-5">Apply for this position</h3>
            <JobApplicationForm jobId={job.id} />
          </div>
        </aside>
      </div>
    </div>
  )
}
