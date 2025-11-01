'use client'

import { useState } from 'react'

export function ResumePreview({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative min-h-[70vh]">
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
        </div>
      )}
      <iframe
        src={url}
        title="Applicant resume"
        className="h-[calc(100vh-220px)] w-full rounded-3xl border border-primary/10"
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
