'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  location: z.string().optional(),
  type: z.enum(['Full-time', 'Part-time', 'Contract', 'Intern']),
  description: z.string().min(10, 'Description required'),
  requirements: z.string().optional(),
  salary_range: z.string().optional(),
  is_active: z.boolean().default(true),
})

type FormValues = z.infer<typeof schema>

export default function NewJobPage() {
  const supabase = createClient()
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true },
  })

  const onSubmit = async (values: FormValues) => {
    const { error } = await supabase.from('jobs').insert(values)

    if (error) {
      alert('Failed to create job')
      return
    }

    router.push('/admin/careers')
    router.refresh()
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/careers" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">Create New Job</h1>
        <p className="text-gray-600">Add a new posting to the careers page</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-6"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Job Title *</label>
            <input {...register('title')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Job Type *</label>
            <select {...register('type')} className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">Select type</option>
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
          <span className="ml-2 text-sm text-gray-700">Publish immediately</span>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/careers" className="px-4 py-2 border border-gray-300 rounded-md">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Create Job
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}


