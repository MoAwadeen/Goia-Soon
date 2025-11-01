import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Briefcase, ToggleRight, ToggleLeft, Plus, Eye, Edit3 } from 'lucide-react'

async function getJobs() {
  const supabase = createClient()
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs Management</h1>
          <p className="text-gray-600">Create and manage job postings</p>
        </div>
        <Link
          href="/admin/careers/new"
          className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Job
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                  Job
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                  Applications
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                  Created
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.map((job: any) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{job.title}</div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                      {job.location && (
                        <span className="inline-flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {job.location}
                        </span>
                      )}
                      <span className="inline-flex items-center">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {job.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                        job.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {job.is_active ? (
                        <>
                          <ToggleRight className="w-3 h-3 mr-1" />Active
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-3 h-3 mr-1" />Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/careers/${job.id}/applications`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {job.job_applications?.[0]?.count || 0} applications
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(job.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/careers/${job.id}/applications`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Link>
                      <Link
                        href={`/admin/careers/${job.id}/edit`}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                      >
                        <Edit3 className="w-4 h-4 mr-1" /> Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-600">
                    No jobs posted yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


