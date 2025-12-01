'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2, Mail, MailCheck } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'reviewing', label: 'Reviewing', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'accepted', label: 'Accepted', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' },
]

export default function ApplicationStatusUpdater({
  applicationId,
  currentStatus,
}: {
  applicationId: string
  currentStatus: string
}) {
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()
  const [status, setStatus] = useState(currentStatus)
  const [updating, setUpdating] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const sendEmail = async (emailType: 'accepted' | 'rejected') => {
    setSendingEmail(true)
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

      setEmailSent(true)
      toast({
        title: 'Email sent successfully',
        description: `The ${emailType === 'accepted' ? 'acceptance' : 'rejection'} email has been sent to the applicant.`,
      })
      setTimeout(() => setEmailSent(false), 5000)
    } catch (error) {
      console.error('[admin] failed to send email', error)
      toast({
        title: 'Failed to send email',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSendingEmail(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!supabase || newStatus === status) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId)

      if (error) throw error

      setStatus(newStatus)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
      router.refresh()
    } catch (error) {
      console.error('[admin] failed to update application status', error)
      toast({
        title: 'Failed to update status',
        description: 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setUpdating(false)
    }
  }

  const currentOption = statusOptions.find((opt) => opt.value === status) || statusOptions[0]

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={updating || sendingEmail}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 ${currentOption.color}`}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {updating && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        {sendingEmail && <Mail className="h-4 w-4 animate-pulse text-primary" />}
        {showSuccess && <CheckCircle className="h-4 w-4 text-green-600" />}
        {(status === 'accepted' || status === 'rejected') && !sendingEmail && !emailSent && (
          <button
            onClick={() => sendEmail(status as 'accepted' | 'rejected')}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/20"
            title={`Send ${status === 'accepted' ? 'acceptance' : 'rejection'} email`}
          >
            <Mail className="h-3 w-3" />
            Send email
          </button>
        )}
          <span title="Email sent">
            <MailCheck className="h-4 w-4 text-green-600" />
          </span>

      </div>
    </div>
  )
}

