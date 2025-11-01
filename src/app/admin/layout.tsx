import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import AdminNavigation from '@/components/AdminNavigation'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || ''
  
  // Allow access to login and unauthorized pages without auth
  const publicRoutes = ['/admin/login', '/admin/unauthorized']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  const supabase = await createClient()
  if (!supabase) {
    if (isPublicRoute) {
      return <>{children}</>
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center space-y-4">
          <h1 className="text-2xl font-semibold text-gray-900">Supabase Not Configured</h1>
          <p className="text-sm text-gray-600">
            Set <code className="rounded bg-gray-100 px-1 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code> and
            <code className="rounded bg-gray-100 px-1 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your <code>.env.local</code> file, then restart the dev server.
          </p>
          <p className="text-xs text-gray-500">
            Visit Supabase dashboard → Settings → API to copy the values. The admin dashboard will activate once the environment variables are provided.
          </p>
        </div>
      </div>
    )
  }

  // For public routes, just render children
  if (isPublicRoute) {
    return <>{children}</>
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/admin/login')
  }

  const { data: admin } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!admin) {
    redirect('/admin/unauthorized')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation userEmail={session.user.email!} />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}


