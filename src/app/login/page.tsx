'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Eye, EyeOff, Briefcase, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

const placeholderImages = {
  background: 'https://drive.google.com/uc?export=view&id=1jeixPZMYCompO1rUxvQEXs26E_uYIsnD',
  rotatingGraphic: 'https://drive.google.com/uc?export=view&id=14VEQNyBBZJNPzPnTIFbDLJBjSrTZsSHf',
  logo: 'https://drive.google.com/uc?export=view&id=1CpgY00g6FnFXzUg78cWSMVtZYbzsp3qp',
}

export default function AdminLoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    if (!supabase) {
      setError('Supabase environment variables are missing. Contact an administrator to configure access.')
      setLoading(false)
      return
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      const { data: admin, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (adminError || !admin) {
        throw new Error('Unauthorized')
      }

      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center p-4 text-center overflow-hidden">
      <Image
        src={placeholderImages.background}
        alt="Background"
        fill
        style={{ objectFit: 'cover' }}
        className="-z-10"
        data-ai-hint="abstract background"
      />

      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-10 px-4 lg:px-6 h-16 flex items-center justify-between bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/careers"
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/90 px-4 py-2 text-sm font-medium text-primary transition hover:border-primary hover:bg-primary/5"
            >
              <Briefcase className="w-4 h-4" />
              Careers
            </Link>
          </div>
        </div>
      </nav>

      <div className="absolute top-20 left-1/2 -translate-x-1/2">
        <Image src={placeholderImages.logo} width="128" height="128" alt="Logo" data-ai-hint="company logo" />
      </div>

      <form
        onSubmit={submit}
        className="animate-in fade-in zoom-in-95 duration-500 bg-white/95 backdrop-blur-sm w-full max-w-md rounded-3xl p-8 shadow-2xl border border-primary/10"
      >
        <h1 className="text-3xl font-bold text-primary mb-2">Admin Sign In</h1>
        <p className="text-sm text-muted-foreground mb-8">Access the Goia careers admin panel</p>

        <div className="space-y-5 text-left">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="w-full rounded-2xl border border-primary/20 bg-white/90 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@goia.app"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                className="w-full rounded-2xl border border-primary/20 bg-white/90 px-4 py-2.5 pr-12 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </div>
      </form>

      <Image
        src={placeholderImages.rotatingGraphic}
        width="200"
        height="200"
        alt="Rotating graphic"
        data-ai-hint="geometric shape"
        className="absolute -bottom-20 -right-20 animate-spin-slow"
      />
    </div>
  )
}


