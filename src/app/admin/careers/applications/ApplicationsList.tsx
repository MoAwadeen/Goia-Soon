'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Briefcase, User, Eye, ArrowRight, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import ResumeDownloadButton from '@/components/ResumeDownloadButton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Application {
  id: string
  full_name: string
  email: string
  status: string
  submitted_at: string
  resume_url: string
  job_id: string
  jobs?: {
    title: string
  }
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'accepted':
      return 'default'
    case 'reviewing':
      return 'secondary'
    case 'rejected':
      return 'destructive'
    default:
      return 'outline'
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'reviewing':
      return 'Reviewing'
    case 'accepted':
      return 'Accepted'
    case 'rejected':
      return 'Rejected'
    default:
      return status
  }
}

export default function ApplicationsList({ applications }: { applications: Application[] }) {
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredApplications = applications.filter(app => {
    if (statusFilter === 'all') return true
    return app.status === statusFilter
  })

  // Get unique statuses from applications
  const statuses = Array.from(new Set(applications.map(app => app.status)))

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="rounded-3xl border border-primary/10 bg-white/90 shadow-md backdrop-blur-sm p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Filter className="w-4 h-4" />
            <span>Filter by status:</span>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>
                  {getStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            Showing {filteredApplications.length} of {applications.length} application{applications.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length ? (
        <div className="grid gap-5">
          {filteredApplications.map((application) => (
            <div
              key={application.id}
              id={`application-${application.id}`}
              className="rounded-3xl border border-primary/10 bg-white/90 shadow-md backdrop-blur-sm p-5 transition hover:shadow-lg"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 text-primary p-3">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-semibold text-foreground">{application.full_name}</div>
                      <Badge variant={getStatusVariant(application.status)}>
                        {getStatusLabel(application.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{application.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {application.jobs?.title ?? 'Job removed'}
                  </span>
                  <span>{new Date(application.submitted_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <ResumeDownloadButton resumePath={application.resume_url} />
                <Link
                  href={`mailto:${application.email}`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/15"
                >
                  Contact applicant
                </Link>
                <Link
                  href={`/admin/careers/${application.job_id}/applications?applicationId=${application.id}#application-${application.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  <Eye className="w-4 h-4" />
                  View full application
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-primary/20 bg-white/80 p-16 text-center text-muted-foreground">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ArrowRight className="w-5 h-5" />
          </div>
          {applications.length === 0 
            ? 'No applications yet. Once candidates submit from the careers page, they will appear here.'
            : `No applications found with status "${getStatusLabel(statusFilter)}".`
          }
        </div>
      )}
    </div>
  )
}

