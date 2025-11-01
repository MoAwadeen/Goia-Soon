'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

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
  const [status, setStatus] = useState(currentStatus)
  const [updating, setUpdating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

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
      alert('Failed to update status. Please try again.')
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
          disabled={updating}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 ${currentOption.color}`}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {updating && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        {showSuccess && <CheckCircle className="h-4 w-4 text-green-600" />}
      </div>
    </div>
  )
}

