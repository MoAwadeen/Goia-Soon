import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'

export default async function ResumeViewer({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams
  const encodedUrl = params.url

  if (!encodedUrl) {
    notFound()
  }

  let resumeUrl: string | null = null
  try {
    resumeUrl = decodeURIComponent(encodedUrl)
    const parsed = new URL(resumeUrl)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol')
    }
  } catch (error) {
    console.error('Invalid resume URL provided', error)
    resumeUrl = null
  }

  if (!resumeUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-primary/10 to-primary/5 flex items-center justify-center px-6">
        <div className="max-w-lg rounded-2xl bg-white/80 backdrop-blur border border-primary/10 shadow-lg p-8 text-center space-y-4">
          <h1 className="text-2xl font-semibold text-primary">Resume unavailable</h1>
          <p className="text-sm text-gray-600">The resume link is invalid or has expired. Ask the applicant to re-upload their resume.</p>
          <Link href="/admin/applications" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to applications
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary/10 to-primary/5">
      <div className="max-w-6xl mx-auto py-6 px-4 lg:px-0">
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin/applications" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to applications
          </Link>
          <Link
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            Open original
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        <div className="rounded-3xl border border-primary/10 bg-white/90 shadow-xl overflow-hidden min-h-[70vh]">
          <iframe
            src={resumeUrl}
            title="Applicant resume"
            className="w-full h-[calc(100vh-220px)]"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}
