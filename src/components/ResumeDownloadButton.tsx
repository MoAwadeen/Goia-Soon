'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResumeDownloadButton({ resumePath }: { resumePath: string | null }) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleDownload = async () => {
    if (!supabase || !resumePath) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(resumePath, 60) // URL valid for 1 minute

      if (error) throw error

      if (data?.signedUrl) {
        // Open in new tab
        window.open(data.signedUrl, '_blank')
      }
    } catch (error) {
      console.error('Failed to download resume:', error)
      alert('Failed to download resume. The file may not exist in storage.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!resumePath) return null

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/15 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          View resume
        </>
      )}
    </button>
  )
}

