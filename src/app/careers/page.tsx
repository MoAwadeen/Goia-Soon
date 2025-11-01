import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Briefcase, BriefcaseBusiness } from 'lucide-react'
import type { Job } from '@/lib/types/database'

async function getJobs(): Promise<Job[]> {
  const supabase = createClient()
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
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Join the Goia Team</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Help us build immersive AR museum experiences that delight visitors worldwide.
        </p>
      </div>

      {jobs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/careers/${job.id}`}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                {job.location && (
                  <span className="inline-flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </span>
                )}
                <span className="inline-flex items-center">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {job.type}
                </span>
              </div>
              {job.description && (
                <p className="mt-4 text-gray-600 line-clamp-3">
                  {job.description}
                </p>
              )}
              <div className="mt-4 text-blue-600 font-medium">View details →</div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BriefcaseBusiness className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">No Open Positions</h3>
          <p className="text-gray-600 mt-2">Check back soon or reach out if you&apos;d like to connect.</p>
        </div>
      )}
    </div>
  )
}


