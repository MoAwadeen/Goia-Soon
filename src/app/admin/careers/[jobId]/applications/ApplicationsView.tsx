'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { User, Clock, Mail, Phone, Linkedin, Download } from 'lucide-react'
import ApplicationStatusUpdater from '@/components/ApplicationStatusUpdater'
import type { JobApplication } from '@/lib/types/database'

export default function ApplicationsView({ applications }: { applications: JobApplication[] }) {
  const searchParams = useSearchParams()
  const applicationId = searchParams.get('applicationId')

  useEffect(() => {
    if (applicationId) {
      // Scroll to the specific application with a slight delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById(`application-${applicationId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Add a brief highlight effect
          element.classList.add('ring-2', 'ring-primary', 'ring-offset-2')
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2')
          }, 2000)
        }
      }, 100)
    }
  }, [applicationId])

  if (!applications.length) {
    return (
      <div className="rounded-3xl border border-dashed border-primary/20 bg-white/95 shadow-lg backdrop-blur-sm p-16 text-center text-muted-foreground">
        No applications yet.
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {applications.map((application) => (
        <div 
          key={application.id} 
          id={`application-${application.id}`}
          className="rounded-3xl border border-primary/10 bg-white/95 shadow-lg backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 text-primary p-3">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-semibold text-primary">{application.full_name}</div>
                <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Applied {new Date(application.submitted_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 items-end">
              <ApplicationStatusUpdater 
                applicationId={application.id} 
                currentStatus={application.status} 
              />
              {(application as any).resume_download_url && (
                <a
                  href={(application as any).resume_download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  <Download className="w-4 h-4" /> Download resume
                </a>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a className="text-primary hover:underline" href={`mailto:${application.email}`}>
                  {application.email}
                </a>
              </div>
              {application.phone && (
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <a className="text-primary hover:underline" href={`tel:${application.phone}`}>
                    {application.phone}
                  </a>
                </div>
              )}
              {application.linkedin_url && (
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Linkedin className="w-4 h-4" />
                  <a
                    className="text-primary hover:underline"
                    href={application.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn profile
                  </a>
                </div>
              )}
            </div>

            {application.cover_letter && (
              <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <div className="text-sm font-semibold text-primary mb-2">Cover letter</div>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {application.cover_letter}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

