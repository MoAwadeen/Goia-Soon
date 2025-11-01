import type { PageProps } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Job } from '@/lib/types/database'
import { MapPin, Briefcase, DollarSign, Calendar } from 'lucide-react'
import JobApplicationForm from '@/components/JobApplicationForm'

async function getJob(jobId: string): Promise<Job | null> {
  const supabase = createClient()
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

export default async function JobDetailsPage({ params }: PageProps<{ jobId: string }>) {
  const { jobId } = await params
  const job = await getJob(jobId)

  if (!job) {
    notFound()
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-gray-600">
          {job.location && (
            <span className="inline-flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              {job.location}
            </span>
          )}
          <span className="inline-flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            {job.type}
          </span>
          {job.salary_range && (
            <span className="inline-flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              {job.salary_range}
            </span>
          )}
          <span className="inline-flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Posted {new Date(job.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {job.description && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Job Description</h2>
              <div className="prose max-w-none">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          )}

          {job.requirements && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Requirements</h2>
              <div className="prose max-w-none">
                {job.requirements.split('\n').map((requirement, index) => (
                  <p key={index}>{requirement}</p>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="bg-gray-50 rounded-xl p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply for this position</h3>
            <JobApplicationForm jobId={job.id} />
          </div>
        </aside>
      </div>
    </div>
  )
}


