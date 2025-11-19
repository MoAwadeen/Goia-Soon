import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminNavigation from '@/components/AdminNavigation'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  if (!supabase) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-lg rounded-2xl border border-primary/10 bg-white/95 p-8 shadow-2xl space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-primary">Supabase not configured</h1>
          <p className="text-sm text-muted-foreground">
            Set <code className="rounded bg-primary/10 px-1 py-0.5 text-primary">NEXT_PUBLIC_SUPABASE_URL</code> and
            <code className="rounded bg-primary/10 px-1 py-0.5 text-primary">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your <code>.env.local</code> file, then restart the dev server.
          </p>
        </div>
      </div>
    )
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: admin } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!admin) {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation userEmail={session.user.email!} />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-6">
        {children}
      </main>
    </div>
  )
}
