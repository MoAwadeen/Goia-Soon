import Link from 'next/link'
import type { PageProps } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, User, Clock, Mail, Phone, Linkedin, Download } from 'lucide-react'
import type { Job, JobApplication } from '@/lib/types/database'

async function getData(jobId: string) {
  const supabase = createClient()
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

export default async function JobApplicationsPage({ params }: PageProps<{ jobId: string }>) {
  const { jobId } = await params
  const result = await getData(jobId)

  if (!result) {
    notFound()
  }

  const { job, applications } = result as { job: Job; applications: JobApplication[] }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/careers" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">{job.title}</h1>
        <p className="text-gray-600">
          {applications.length} application{applications.length !== 1 ? 's' : ''}
        </p>
      </div>

      {applications.length ? (
        <div className="space-y-6">
          {applications.map((application) => (
            <div key={application.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{application.full_name}</div>
                    <div className="text-sm text-gray-600 inline-flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Applied {new Date(application.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="text-gray-700 inline-flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <a className="text-blue-600 hover:underline" href={`mailto:${application.email}`}>
                      {application.email}
                    </a>
                  </div>
                  {application.phone && (
                    <div className="text-gray-700 inline-flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      <a className="text-blue-600 hover:underline" href={`tel:${application.phone}`}>
                        {application.phone}
                      </a>
                    </div>
                  )}
                  {application.linkedin_url && (
                    <div className="text-gray-700 inline-flex items-center">
                      <Linkedin className="w-4 h-4 mr-2" />
                      <a
                        className="text-blue-600 hover:underline"
                        href={application.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        LinkedIn
                      </a>
                    </div>
                  )}
                  {application.resume_url && (
                    <div className="text-gray-700 inline-flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      <a
                        className="text-blue-600 hover:underline"
                        href={application.resume_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download Resume
                      </a>
                    </div>
                  )}
                </div>

                {application.cover_letter && (
                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-2">Cover Letter</div>
                    <div className="bg-gray-50 rounded-md p-4">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{application.cover_letter}</p>
                    </div>
                  </div>
                )}
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


