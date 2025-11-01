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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-3xl border border-primary/10 bg-white/90 shadow-lg backdrop-blur-sm p-6 space-y-6"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Job title *</label>
          <input
            {...register('title')}
            className="w-full rounded-2xl border border-primary/20 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Job type *</label>
          <select
            {...register('type')}
            className="w-full rounded-2xl border border-primary/20 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Intern">Intern</option>
          </select>
          {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Location</label>
          <input
            {...register('location')}
            className="w-full rounded-2xl border border-primary/20 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Salary range</label>
          <input
            {...register('salary_range')}
            className="w-full rounded-2xl border border-primary/20 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground/80">Job description *</label>
        <textarea
          {...register('description')}
          rows={8}
          className="w-full rounded-3xl border border-primary/20 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground/80">Requirements</label>
        <textarea
          {...register('requirements')}
          rows={6}
          className="w-full rounded-3xl border border-primary/20 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80">
        <input
          type="checkbox"
          {...register('is_active')}
          className="h-4 w-4 rounded border border-primary/30 text-primary focus:ring-primary/40"
        />
        Publish job
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save changes
            </>
          )}
        </button>
      </div>
    </form>
  )
}
