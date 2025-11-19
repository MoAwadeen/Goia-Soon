'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Briefcase, Users, Mail, LayoutDashboard, User } from 'lucide-react'
import { Logo } from '@/components/icons/Logo'

export default function AdminNavigation({ userEmail }: { userEmail: string }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const signOut = async () => {
    if (!supabase) {
      console.warn('Supabase client unavailable. Sign out is disabled.')
      return
    }
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin'
    }
    return pathname?.startsWith(path)
  }

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/careers/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/admin/careers/applications', label: 'Applications', icon: Users },
    { href: '/admin/careers/emails/templates', label: 'Templates', icon: Mail },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-primary/10 bg-background/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        <Link 
          href="/admin" 
          className="flex items-center gap-2 text-lg font-bold text-primary hover:opacity-80 transition"
        >
          <Logo className="h-5 w-5" />
          <span>Goia Admin</span>
        </Link>
        
        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all
                  ${active 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{link.label}</span>
                {active && (
                  <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-1/2 -translate-x-1/2 rounded-full bg-primary-foreground/20" />
                )}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground sm:flex">
            <User className="w-3.5 h-3.5" />
            <span className="max-w-[120px] truncate">{userEmail}</span>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-muted hover:border-primary/20"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
