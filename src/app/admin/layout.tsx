import { ReactNode } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminNavigation from '@/components/AdminNavigation'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const headerList = headers()
  const currentPath =
    headerList.get('x-invoke-path') ??
    headerList.get('x-matched-path') ??
    headerList.get('x-current-pathname') ??
    ''

  const publicRoutes = ['/admin/login', '/admin/unauthorized']

  if (publicRoutes.includes(currentPath)) {
    return <>{children}</>
  }

  const supabase = createClient()
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


