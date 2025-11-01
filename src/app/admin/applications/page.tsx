import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Briefcase, User } from 'lucide-react'

async function getApplications() {
  const supabase = createClient()
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Applications</h1>
        <p className="text-gray-600">Review recent submissions across every job posting</p>
      </div>

      {applications.length ? (
        <div className="space-y-4">
          {applications.map((application: any) => (
            <div key={application.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{application.full_name}</div>
                    <div className="text-sm text-gray-600">{application.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="inline-flex items-center">
                    <Briefcase className="w-4 h-4 mr-1" />
                    {application.jobs?.title ?? 'Job removed'}
                  </span>
                  <span>{new Date(application.submitted_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`mailto:${application.email}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Contact applicant
                </Link>
                <Link
                  href={`/admin/careers/${application.job_id}/applications`}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  View full application
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-600">
          No applications yet.
        </div>
      )}
    </div>
  )
}


