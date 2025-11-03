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
    if (!supabase) {
      alert('Supabase environment variables are missing. Unable to create job.')
      return
    }
    const { error } = await supabase.from('jobs').insert(values)

    if (error) {
      alert('Failed to create job')
      return
    }

    router.push('/admin/careers/jobs')
    router.refresh()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-3">
        <Link href="/admin/careers/jobs" className="inline-flex items-center gap-2 text-primary hover:text-primary/80">
          <ArrowLeft className="w-4 h-4" />
          Back to jobs
        </Link>
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Create new job</h1>
          <p className="text-sm text-muted-foreground">
            Share a new opening with candidates. You can update or pause the posting at any time.
          </p>
        </div>
      </div>

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
              placeholder="Senior UX Designer"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Job type *</label>
            <select
              {...register('type')}
              className="w-full rounded-2xl border border-primary/20 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select type</option>
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
              placeholder="Remote / Cairo"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Salary range</label>
            <input
              {...register('salary_range')}
              className="w-full rounded-2xl border border-primary/20 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder=" – "
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Job description *</label>
          <textarea
            {...register('description')}
            rows={8}
            className="w-full rounded-3xl border border-primary/20 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="Introduce the role, responsibilities, and expectations."
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Requirements</label>
          <textarea
            {...register('requirements')}
            rows={6}
            className="w-full rounded-3xl border border-primary/20 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="List qualifications, skills, and experience you'd like to see."
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80">
          <input
            type="checkbox"
            {...register('is_active')}
            className="h-4 w-4 rounded border border-primary/30 text-primary focus:ring-primary/40"
          />
          Publish immediately
        </label>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/careers/jobs"
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-4 py-2 text-sm font-medium text-primary transition hover:border-primary hover:bg-primary/5"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Create job
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
