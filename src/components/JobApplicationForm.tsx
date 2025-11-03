'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react'

const formSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  linkedinUrl: z.string().optional().or(z.literal('')).refine(
    (val) => !val || val.trim() === '' || val.includes('linkedin.com') || !val.includes('http'),
    'Please enter a LinkedIn URL or username'
  ),
  coverLetter: z.string().min(10, 'Please add a brief cover letter'),
  resume: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, 'Resume is required')
    .refine((files) => files[0]?.size <= 5 * 1024 * 1024, 'Max 5MB')
    .refine(
      (files) =>
        ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(
          files[0]?.type
        ),
      'PDF or Word only'
    ),
})

type FormValues = z.infer<typeof formSchema>

export default function JobApplicationForm({ jobId }: { jobId: string }) {
  const supabase = createClient()
  const [state, setState] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  const onSubmit = async (values: FormValues) => {
    if (!supabase) {
      setState('error')
      return
    }

    setSubmitting(true)
    setState('idle')

    try {
      const file = values.resume[0]
      const extension = file.name.split('.').pop()
      const safeName = values.fullName.replace(/\s+/g, '_')
      const path = `${safeName}_${Date.now()}.${extension}`

      const { error: uploadError } = await supabase.storage.from('resumes').upload(path, file)
      if (uploadError) throw uploadError

      // Normalize LinkedIn URL
      let linkedinUrl = values.linkedinUrl?.trim() || null
      if (linkedinUrl && !linkedinUrl.startsWith('http')) {
        // If user enters just username or partial URL, make it a full URL
        if (linkedinUrl.startsWith('linkedin.com')) {
          linkedinUrl = `https://${linkedinUrl}`
        } else if (!linkedinUrl.includes('linkedin.com')) {
          linkedinUrl = `https://linkedin.com/in/${linkedinUrl}`
        }
      }

      const { error: insertError } = await supabase.from('job_applications').insert({
        job_id: jobId,
        full_name: values.fullName,
        email: values.email,
        phone: values.phone || null,
        linkedin_url: linkedinUrl,
        cover_letter: values.coverLetter,
        resume_url: path,
      })
      if (insertError) throw insertError

      setState('success')
      reset()
    } catch (error) {
      console.error('[careers] failed to submit application', error)
      setState('error')
    } finally {
      setSubmitting(false)
    }
  }

  if (state === 'success') {
    return (
      <div className="rounded-3xl border border-primary/20 bg-primary/5 px-6 py-8 text-center">
        <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" />
        <p className="text-lg font-semibold text-foreground">Application submitted!</p>
        <p className="text-sm text-muted-foreground">Thank you for applying. Our team will be in touch soon.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">Full name *</label>
          <input
            {...register('fullName')}
            className="w-full rounded-2xl border border-primary/20 bg-white/90 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="Alex Morgan"
          />
          {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">Email *</label>
          <input
            {...register('email')}
            type="email"
            className="w-full rounded-2xl border border-primary/20 bg-white/90 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">Phone</label>
          <input
            {...register('phone')}
            className="w-full rounded-2xl border border-primary/20 bg-white/90 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="+20 ..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">LinkedIn</label>
          <input
            {...register('linkedinUrl')}
            type="text"
            className="w-full rounded-2xl border border-primary/20 bg-white/90 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="https://linkedin.com/in/yourprofile or just 'yourprofile'"
          />
          {errors.linkedinUrl && <p className="text-xs text-destructive mt-1">{errors.linkedinUrl.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">Resume (PDF/DOC, max 5MB) *</label>
          <div className="relative">
            <input
              {...register('resume')}
              type="file"
              accept=".pdf,.doc,.docx"
              className="w-full rounded-2xl border border-primary/20 bg-white/90 px-4 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-1.5 file:text-primary file:font-medium focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <Upload className="w-4 h-4 text-primary absolute right-3 top-3.5" />
          </div>
          {errors.resume && <p className="text-xs text-destructive mt-1">{errors.resume.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">Cover letter *</label>
          <textarea
            {...register('coverLetter')}
            rows={4}
            className="w-full rounded-2xl border border-primary/20 bg-white/90 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="Tell us why you'd be a great fit..."
          />
          {errors.coverLetter && <p className="text-xs text-destructive mt-1">{errors.coverLetter.message}</p>}
        </div>
      </div>

      {state === 'error' && (
        <div className="flex items-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive">
          <AlertCircle className="w-4 h-4" />
          Failed to submit. Please try again.
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit application'
        )}
      </button>
    </form>
  )
}
