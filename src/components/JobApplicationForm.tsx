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
  linkedinUrl: z
    .string()
    .url('Enter a valid URL')
    .optional()
    .or(z.literal('')),
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

      const { data: publicUrlData } = supabase.storage.from('resumes').getPublicUrl(path)

      const resumeUrl = publicUrlData.publicUrl

      const { error: insertError } = await supabase.from('job_applications').insert({
        job_id: jobId,
        full_name: values.fullName,
        email: values.email,
        phone: values.phone || null,
        linkedin_url: values.linkedinUrl || null,
        cover_letter: values.coverLetter,
        resume_url: resumeUrl,
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
      <div className="text-center py-6">
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
        <p className="text-gray-800 font-medium">Application submitted!</p>
        <p className="text-sm text-gray-600">We will review and get back to you.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Full Name *</label>
        <input
          {...register('fullName')}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="John Doe"
        />
        {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email *</label>
        <input
          {...register('email')}
          type="email"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="john@example.com"
        />
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input
          {...register('phone')}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="+20 ..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">LinkedIn</label>
        <input
          {...register('linkedinUrl')}
          type="url"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="https://linkedin.com/in/..."
        />
        {errors.linkedinUrl && <p className="text-xs text-red-600 mt-1">{errors.linkedinUrl.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Resume (PDF/DOC, max 5MB) *</label>
        <div className="relative">
          <input
            {...register('resume')}
            type="file"
            accept=".pdf,.doc,.docx"
            className="w-full border border-gray-300 rounded-md px-3 py-2 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
          />
          <Upload className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
        </div>
        {errors.resume && <p className="text-xs text-red-600 mt-1">{errors.resume.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Cover Letter *</label>
        <textarea
          {...register('coverLetter')}
          rows={4}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="Tell us why you'd be a great fit..."
        />
        {errors.coverLetter && <p className="text-xs text-red-600 mt-1">{errors.coverLetter.message}</p>}
      </div>

      {state === 'error' && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-2" />
          Failed to submit. Please try again.
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Application'
        )}
      </button>
    </form>
  )
}


