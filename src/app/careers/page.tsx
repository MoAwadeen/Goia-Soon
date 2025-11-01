import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Briefcase, BriefcaseBusiness, ArrowRight } from 'lucide-react'
import type { Job } from '@/lib/types/database'

async function getJobs(): Promise<Job[]> {
  const supabase = await createClient()
  if (!supabase) {
    console.warn('Supabase client unavailable. Returning empty jobs list.')
    return []
  }
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[careers] failed to load jobs', error)
    return []
  }

  return data || []
}

export default async function CareersPage() {
  const jobs = await getJobs()

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-primary/10 bg-white/90 px-6 py-12 text-center shadow-lg backdrop-blur-sm">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
          We&apos;re hiring
        </span>
        <h1 className="mt-4 text-4xl font-semibold text-foreground md:text-5xl">
          Join the team shaping immersive museum experiences
        </h1>
        <p className="mt-4 text-base text-muted-foreground md:text-lg max-w-3xl mx-auto">
          We&apos;re building digital layers for the world&apos;s most inspiring spaces. Work with designers, artists, and technologists to bring culture to life in augmented reality.
        </p>
      </section>

      {jobs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/careers/${job.id}`}
              className="group rounded-3xl border border-primary/10 bg-white/90 p-6 shadow-md backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{job.title}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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
                <div className="rounded-full bg-primary/10 p-2 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              {job.description && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-4">
                  {job.description}
                </p>
              )}
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
                View details
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-primary/20 bg-white/80 p-14 text-center text-muted-foreground">
          <BriefcaseBusiness className="mx-auto mb-4 h-12 w-12 text-primary/50" />
          <h3 className="text-lg font-semibold text-foreground">No open positions</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;re not hiring right now, but we&apos;d still love to hear from you. Reach out and let&apos;s keep in touch.
          </p>
        </div>
      )}
    </div>
  )
}
