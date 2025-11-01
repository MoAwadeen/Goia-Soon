import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Job } from '@/lib/types/database'
import EditJobForm from './EditJobForm'

async function getJob(jobId: string): Promise<Job | null> {
  const supabase = createClient()
  if (!supabase) {
    console.warn('Supabase client unavailable. Unable to load job for editing.')
    return null
  }
  const { data, error } = await supabase.from('jobs').select('*').eq('id', jobId).single()

  if (error) {
    console.error('[admin] failed to load job for editing', error)
    return null
  }

  return data
}

export default async function EditJobPage({ params }: { params: { jobId: string } }) {
  const job = await getJob(params.jobId)

  if (!job) {
    notFound()
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/careers" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">Edit Job</h1>
        <p className="text-gray-600">Update job details and publish status</p>
      </div>

      <EditJobForm job={job} />
    </div>
  )
}


