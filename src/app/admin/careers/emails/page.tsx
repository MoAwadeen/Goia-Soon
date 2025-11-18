import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import EmailSender from './EmailSender'

async function getApplications() {
  const supabase = await createClient()
  if (!supabase) {
    console.warn('Supabase client unavailable. Returning empty applications list.')
    return []
  }
  const { data, error } = await supabase
    .from('job_applications')
    .select('*, jobs(title)')
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('[admin] failed to load applications', error)
    return []
  }

  return data || []
}

export default async function EmailManagementPage() {
  const applications = await getApplications()

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-primary/10 bg-white/95 shadow-2xl backdrop-blur-sm p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-primary">Email Management</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Send acceptance and rejection emails to applicants. Select applicants and choose the email type to send professional notifications.
              </p>
            </div>
            <Link
              href="/admin/careers/emails/templates"
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2 text-sm font-medium text-primary transition hover:border-primary hover:bg-primary/5"
            >
              Edit Templates
            </Link>
          </div>
        </div>
      </header>

      <EmailSender applications={applications} />
    </div>
  )
}

