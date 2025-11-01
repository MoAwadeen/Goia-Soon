'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Briefcase, Users } from 'lucide-react'

export default function AdminNavigation({ userEmail }: { userEmail: string }) {
  const supabase = createClient()
  const router = useRouter()

  const signOut = async () => {
    if (!supabase) {
      console.warn('Supabase client unavailable. Sign out is disabled.')
      return
    }
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="border-b border-primary/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-0">
        <Link href="/admin/careers" className="text-lg font-semibold text-primary">
          Goia Admin
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/careers"
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/10"
          >
            <Briefcase className="w-4 h-4" /> Jobs
          </Link>
          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/10"
          >
            <Users className="w-4 h-4" /> Applications
          </Link>
          <div className="hidden text-xs font-medium uppercase tracking-wide text-muted-foreground sm:block">
            {userEmail}
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-3 py-1.5 text-sm font-medium text-primary transition hover:border-primary hover:bg-primary/5"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
