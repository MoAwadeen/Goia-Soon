'use client'

import { useState } from 'react'
import { Mail, CheckCircle, XCircle, Loader2, User, Send, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"
import { useToast } from '@/hooks/use-toast'
import { Card } from '@/components/ui/card'

interface Application {
  id: string
  full_name: string
  email: string
  status: string
  submitted_at: string
  job_id: string
  jobs?: {
    title: string
  }
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'accepted':
      return 'outline' // Will use custom green styling
    case 'reviewing':
      return 'secondary'
    case 'rejected':
      return 'destructive'
    default:
      return 'outline'
  }
}

function getStatusClassName(status: string): string {
  switch (status) {
    case 'accepted':
      return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100'
    default:
      return ''
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

export default function EmailSender({ applications }: { applications: Application[] }) {
  const { toast } = useToast()
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set())
  const [emailType, setEmailType] = useState<'accepted' | 'rejected'>('accepted')
  const [sending, setSending] = useState(false)
  const [sentEmails, setSentEmails] = useState<Set<string>>(new Set())
  const [showPreview, setShowPreview] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredApplications = applications.filter(app => {
    if (filterStatus === 'all') return true
    return app.status === filterStatus
  })

  const handleSelectAll = () => {
    if (selectedApplications.size === filteredApplications.length) {
      setSelectedApplications(new Set())
    } else {
      setSelectedApplications(new Set(filteredApplications.map(app => app.id)))
    }
  }

  const handleSelectApplication = (applicationId: string) => {
    const newSelected = new Set(selectedApplications)
    if (newSelected.has(applicationId)) {
      newSelected.delete(applicationId)
    } else {
      newSelected.add(applicationId)
    }
    setSelectedApplications(newSelected)
  }

  const getEmailPreview = (application: Application) => {
    const jobTitle = application.jobs?.title || 'the position'
    const isAcceptance = emailType === 'accepted'
    
    return {
      subject: isAcceptance
        ? `Congratulations! Your application for ${jobTitle} has been accepted`
        : `Update on your application for ${jobTitle}`,
      recipient: application.email,
      applicantName: application.full_name,
      jobTitle: jobTitle,
    }
  }

  const handleSendEmails = async () => {
    if (selectedApplications.size === 0) {
      toast({
        title: 'No applicants selected',
        description: 'Please select at least one applicant to send an email to.',
        variant: 'destructive',
      })
      return
    }

    setSending(true)
    const results: { success: string[]; failed: { id: string; name: string; error: string }[] } = {
      success: [],
      failed: [],
    }

    for (const applicationId of selectedApplications) {
      const application = applications.find(app => app.id === applicationId)
      if (!application) continue

      try {
        const response = await fetch('/api/emails/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId,
            emailType,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send email')
        }

        results.success.push(application.full_name)
        setSentEmails(prev => new Set([...prev, applicationId]))
      } catch (error) {
        results.failed.push({
          id: applicationId,
          name: application.full_name,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    setSending(false)
    setSelectedApplications(new Set())

    if (results.success.length > 0) {
      toast({
        title: 'Emails sent successfully',
        description: `Successfully sent ${results.success.length} email${results.success.length > 1 ? 's' : ''} to ${results.success.join(', ')}.`,
      })
    }

    if (results.failed.length > 0) {
      toast({
        title: 'Some emails failed',
        description: `Failed to send ${results.failed.length} email${results.failed.length > 1 ? 's' : ''}. Please try again.`,
        variant: 'destructive',
      })
    }
  }

  const selectedApplicationsList = Array.from(selectedApplications)
    .map(id => applications.find(app => app.id === id))
    .filter(Boolean) as Application[]

  const canSendAcceptance = selectedApplicationsList.some(app => app.status !== 'rejected')
  const canSendRejection = selectedApplicationsList.some(app => app.status !== 'accepted')

  return (
    <div className="space-y-6">
      {/* Email Type Selector */}
      <Card className="rounded-3xl border border-primary/10 bg-white/90 shadow-md backdrop-blur-sm p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email Type</label>
            <Select value={emailType} onValueChange={(value: 'accepted' | 'rejected') => setEmailType(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accepted">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Acceptance Email
                  </div>
                </SelectItem>
                <SelectItem value="rejected">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    Rejection Email
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-2"
            >
              {showPreview ? (
                <>
                  <EyeOff className="w-4 h-4" /> Hide Preview
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" /> Show Preview
                </>
              )}
            </Button>

            <Button
              onClick={handleSendEmails}
              disabled={sending || selectedApplications.size === 0 || (emailType === 'accepted' && !canSendAcceptance) || (emailType === 'rejected' && !canSendRejection)}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send {selectedApplications.size} Email{selectedApplications.size !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>

        {selectedApplications.size > 0 && (
          <div className="mt-4">
            <Alert className={emailType === 'accepted' && !canSendAcceptance || emailType === 'rejected' && !canSendRejection ? 'border-yellow-200 bg-yellow-50' : ''}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {emailType === 'accepted' && !canSendAcceptance
                  ? 'Some selected applicants have already been rejected. Consider sending a rejection email instead, or select only accepted applicants.'
                  : emailType === 'rejected' && !canSendRejection
                  ? 'Some selected applicants have already been accepted. Consider sending an acceptance email instead, or select only rejected applicants.'
                  : `Ready to send ${emailType === 'accepted' ? 'acceptance' : 'rejection'} emails to ${selectedApplications.size} applicant${selectedApplications.size !== 1 ? 's' : ''}.`}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {showPreview && selectedApplicationsList.length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Email Preview</h3>
            {selectedApplicationsList.slice(0, 3).map(app => {
              const preview = getEmailPreview(app)
              return (
                <div key={app.id} className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm">
                  <div className="mb-2">
                    <span className="font-medium">To:</span> {preview.recipient}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Subject:</span> {preview.subject}
                  </div>
                  <div className="text-muted-foreground">
                    {emailType === 'accepted'
                      ? `Congratulations ${preview.applicantName}! Your application for ${preview.jobTitle} has been accepted.`
                      : `Thank you ${preview.applicantName} for applying to ${preview.jobTitle}. Unfortunately...`}
                  </div>
                </div>
              )
            })}
            {selectedApplicationsList.length > 3 && (
              <div className="text-xs text-muted-foreground">
                ...and {selectedApplicationsList.length - 3} more
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Filter */}
      <div className="rounded-3xl border border-primary/10 bg-white/95 shadow-lg backdrop-blur-sm p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={handleSelectAll}
            className="text-sm"
          >
            {selectedApplications.size === filteredApplications.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length > 0 ? (
        <div className="grid gap-4">
          {filteredApplications.map((application) => {
            const isSelected = selectedApplications.has(application.id)
            const isSent = sentEmails.has(application.id)
            const preview = getEmailPreview(application)

            return (
              <Card
                key={application.id}
                className={`rounded-3xl border transition-all duration-200 ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-primary/10 bg-white/95 shadow-lg backdrop-blur-sm hover:-translate-y-1 hover:shadow-2xl'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelectApplication(application.id)}
                        disabled={sending}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-primary" />
                            <h3 className="text-lg font-semibold text-primary">{application.full_name}</h3>
                            <Badge variant={getStatusVariant(application.status)} className={getStatusClassName(application.status)}>
                              {getStatusLabel(application.status)}
                            </Badge>
                            {isSent && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Mail className="w-3 h-3 mr-1" />
                                Email Sent
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{application.email}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {application.jobs?.title || 'Job removed'} • {new Date(application.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                          <div className="text-xs font-medium text-primary mb-2">Email Preview</div>
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="font-medium">Subject:</span> {preview.subject}
                            </div>
                            <div className="text-muted-foreground">
                              {emailType === 'accepted'
                                ? `This email will congratulate ${application.full_name} on their acceptance for the ${preview.jobTitle} position.`
                                : `This email will inform ${application.full_name} that their application for ${preview.jobTitle} was not selected.`}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-primary/20 bg-white/95 shadow-lg backdrop-blur-sm p-16 text-center text-muted-foreground">
          <Mail className="w-12 h-12 mx-auto mb-4 text-primary/50" />
          <p>No applications found with the selected filter.</p>
        </div>
      )}
    </div>
  )
}

