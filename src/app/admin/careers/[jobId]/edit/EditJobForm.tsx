'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save } from 'lucide-react'
import type { Job } from '@/lib/types/database'

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  location: z.string().optional(),
  type: z.enum(['Full-time', 'Part-time', 'Contract', 'Intern']),
  description: z.string().min(10, 'Description required'),
  requirements: z.string().optional(),
  salary_range: z.string().optional(),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export default function EditJobForm({ job }: { job: Job }) {
  const supabase = createClient()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: job.title,
      location: job.location ?? undefined,
      type: job.type as FormValues['type'],
      description: job.description ?? '',
      requirements: job.requirements ?? '',
      salary_range: job.salary_range ?? '',
      is_active: job.is_active,
    },
  })

  const onSubmit = async (values: FormValues) => {
    if (!supabase) {
      alert('Supabase environment variables are missing. Unable to update job.')
      return
    }
    const { error } = await supabase
      .from('jobs')
      .update({
        title: values.title,
        location: values.location || null,
        type: values.type,
        description: values.description,
        requirements: values.requirements || null,
        salary_range: values.salary_range || null,
        is_active: values.is_active,
      })
      .eq('id', job.id)
      .select()

    if (error) {
      alert('Failed to update job')
      return
    }

    router.push('/admin/careers')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Job Title *</label>
          <input {...register('title')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
          {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Job Type *</label>
          <select {...register('type')} className="w-full border border-gray-300 rounded-md px-3 py-2">
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Intern">Intern</option>
          </select>
          {errors.type && <p className="text-xs text-red-600 mt-1">{errors.type.message}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input {...register('location')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Salary Range</label>
          <input {...register('salary_range')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Job Description *</label>
        <textarea
          {...register('description')}
          rows={8}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
        {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Requirements</label>
        <textarea
          {...register('requirements')}
          rows={6}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('is_active')}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <span className="ml-2 text-sm text-gray-700">Publish job</span>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  )
}


