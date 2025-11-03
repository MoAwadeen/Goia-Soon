import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Briefcase, Users, BarChart, Settings, ArrowRight } from 'lucide-react'

async function getStats() {
  const supabase = await createClient()
  if (!supabase) {
    return { jobsCount: 0, applicationsCount: 0, activeJobsCount: 0, pendingCount: 0 }
  }

  const [jobsResult, applicationsResult, activeJobsResult, pendingResult] = await Promise.all([
    supabase.from('jobs').select('id', { count: 'exact', head: true }),
    supabase.from('job_applications').select('id', { count: 'exact', head: true }),
    supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('job_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  return {
    jobsCount: jobsResult.count || 0,
    applicationsCount: applicationsResult.count || 0,
    activeJobsCount: activeJobsResult.count || 0,
    pendingCount: pendingResult.count || 0,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-primary/10 bg-white/90 shadow-lg backdrop-blur-sm p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome to the Goia careers admin panel. Manage your job postings and review applications.
          </p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-primary/10 bg-white/90 shadow-md backdrop-blur-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Jobs</p>
              <p className="text-3xl font-bold text-foreground">{stats.jobsCount}</p>
            </div>
            <div className="rounded-2xl bg-primary/10 text-primary p-3">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{stats.activeJobsCount} active</p>
        </div>

        <div className="rounded-3xl border border-primary/10 bg-white/90 shadow-md backdrop-blur-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Applications</p>
              <p className="text-3xl font-bold text-foreground">{stats.applicationsCount}</p>
            </div>
            <div className="rounded-2xl bg-primary/10 text-primary p-3">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{stats.pendingCount} pending review</p>
        </div>

        <div className="rounded-3xl border border-primary/10 bg-white/90 shadow-md backdrop-blur-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
              <p className="text-3xl font-bold text-foreground">{stats.activeJobsCount}</p>
            </div>
            <div className="rounded-2xl bg-green-500/10 text-green-600 p-3">
              <BarChart className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Currently accepting applications</p>
        </div>

        <div className="rounded-3xl border border-primary/10 bg-white/90 shadow-md backdrop-blur-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-foreground">{stats.pendingCount}</p>
            </div>
            <div className="rounded-2xl bg-amber-500/10 text-amber-600 p-3">
              <Settings className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Awaiting review</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Link
            href="/admin/careers/jobs"
            className="group rounded-3xl border border-primary/10 bg-white/90 shadow-md backdrop-blur-sm p-6 transition hover:shadow-lg hover:border-primary/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-primary/10 text-primary p-3">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Manage Jobs</h3>
                  <p className="text-sm text-muted-foreground">Create, edit, and manage job postings</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-primary transition group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/admin/careers/applications"
            className="group rounded-3xl border border-primary/10 bg-white/90 shadow-md backdrop-blur-sm p-6 transition hover:shadow-lg hover:border-primary/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-primary/10 text-primary p-3">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Review Applications</h3>
                  <p className="text-sm text-muted-foreground">View and manage all job applications</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-primary transition group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity or Instructions */}
      <div className="rounded-3xl border border-primary/10 bg-primary/5 p-6">
        <h3 className="text-lg font-semibold text-primary mb-3">Getting Started</h3>
        <ul className="space-y-2 text-sm text-foreground/80">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Create and publish job postings to attract candidates</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Review applications and update their status as you progress</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Download resumes and contact applicants directly</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Track all applications from a single dashboard</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

