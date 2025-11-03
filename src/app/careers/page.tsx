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
    <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
      <section className="rounded-3xl border border-primary/10 bg-white/95 px-8 py-16 text-center shadow-2xl backdrop-blur-sm">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary">
          We&apos;re hiring
        </span>
        <h1 className="mt-6 text-4xl font-bold text-primary drop-shadow-sm md:text-5xl lg:text-6xl">
          Join the team shaping the tourism future!
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
          We&apos;re building digital layers for the world&apos;s most inspiring spaces. Work with designers, artists, and technologists to bring history to life in one app.
        </p>
      </section>

      {jobs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/careers/${job.id}`}
              className="group rounded-3xl border border-primary/10 bg-white/95 p-7 shadow-lg backdrop-blur-sm transition hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-primary">{job.title}</h3>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {job.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" />
                      {job.type}
                    </span>
                  </div>
                </div>
                <div className="rounded-full bg-primary/10 p-2.5 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
              {job.description && (
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {job.description}
                </p>
              )}
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                View details
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-primary/20 bg-white/90 p-16 text-center shadow-lg backdrop-blur-sm">
          <BriefcaseBusiness className="mx-auto mb-5 h-16 w-16 text-primary/40" />
          <h3 className="text-xl font-bold text-primary">No open positions</h3>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            We&apos;re not hiring right now, but we&apos;d still love to hear from you. Reach out and let&apos;s keep in touch.
          </p>
        </div>
      )}
    </div>
  )
}
