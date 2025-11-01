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
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/admin/careers" className="text-xl font-semibold text-gray-900">
          Goia Admin
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/admin/careers" className="inline-flex items-center text-gray-700 hover:text-blue-600">
            <Briefcase className="w-4 h-4 mr-2" />
            Jobs
          </Link>
          <Link href="/admin/applications" className="inline-flex items-center text-gray-700 hover:text-blue-600">
            <Users className="w-4 h-4 mr-2" />
            Applications
          </Link>
          <div className="text-sm text-gray-600">{userEmail}</div>
          <button onClick={signOut} className="inline-flex items-center text-gray-700 hover:text-red-600">
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}


