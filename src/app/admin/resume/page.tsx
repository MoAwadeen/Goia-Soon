import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, FileWarning } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { ResumePreview } from './ResumePreview'

export default async function ResumeViewer({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams
  const encodedPath = params.path ?? params.url

  if (!encodedPath) {
    notFound()
  }

  let storagePath: string | null = null
  try {
    const decoded = decodeURIComponent(encodedPath)
    storagePath = decoded.startsWith('http') ? decoded : decoded.replace(/^\/+/, '')
  } catch (error) {
    console.error('Failed to decode resume path', error)
    storagePath = null
  }

  let signedUrl: string | null = null

  if (storagePath) {
    if (storagePath.startsWith('http')) {
      signedUrl = storagePath
    } else if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.storage.from('resumes').createSignedUrl(storagePath, 60 * 10)
      if (error) {
        console.error('Failed to create signed URL', error)
      } else {
        signedUrl = data?.signedUrl ?? null
      }
    }
  }

  if (!signedUrl) {
    return (
      <div className="min-h-screen bg-primary/5 flex items-center justify-center px-6">
        <div className="max-w-lg rounded-2xl border border-primary/10 bg-white p-8 text-center space-y-4 shadow-lg">
          <FileWarning className="mx-auto h-10 w-10 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">Resume unavailable</h1>
          <p className="text-sm text-muted-foreground">
            The resume link is invalid or has expired. Ask the applicant to re-upload their file or check your Supabase storage bucket configuration.
          </p>
          <Link href="/admin/applications" className="inline-flex items-center gap-2 text-primary font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to applications
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary/5">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-0">
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin/applications" className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary/80">
            <ArrowLeft className="w-4 h-4" /> Back to applications
          </Link>
          <Link
            href={signedUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            Open original
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        <ResumePreview url={signedUrl} />
      </div>
    </div>
  )
}
