import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Job } from '@/lib/types/database'
import EditJobForm from './EditJobForm'

async function getJob(jobId: string): Promise<Job | null> {
  const supabase = await createClient()
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

export default async function EditJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  const job = await getJob(jobId)

  if (!job) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <Link href="/admin/careers" className="inline-flex items-center gap-2 text-primary hover:text-primary/80">
          <ArrowLeft className="w-4 h-4" />
          Back to jobs
        </Link>
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Edit job</h1>
          <p className="text-sm text-muted-foreground">Update job details and publishing status.</p>
        </div>
      </div>

      <EditJobForm job={job} />
    </div>
  )
}
