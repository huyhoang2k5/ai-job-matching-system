'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'candidate' | 'employer'>('candidate')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  
  const { register, isLoading, error, clearError } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'employer' || roleParam === 'candidate') {
      setRole(roleParam)
    }
  }, [searchParams])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    if (!name.trim()) {
      newErrors.name = 'Name is required'
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    if (!validateForm()) {
      return
    }
    
    try {
      await register(name, email, password, role)
      router.push('/dashboard')
    } catch (err) {
      // Error is handled in store
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left Column: Brand & Info (Visible on LG screens) */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 bg-accent relative overflow-hidden border-r border-border">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 rotate-3 transition-transform hover:rotate-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tighter">
              Job<span className="text-primary font-black">Sync</span>
            </h1>
          </Link>
        </div>

        {/* Copy */}
        <div className="relative z-10 my-auto space-y-8">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white text-primary border border-primary/10">
            🚀 Elevate your career
          </span>
          <h1 className="text-4xl font-bold tracking-tight leading-tight text-foreground">
            The smartest way <br />
            to <span className="text-primary">find your next role</span>.
          </h1>
          <p className="text-muted text-base leading-relaxed max-w-sm font-medium">
            Join thousands of professionals and top-tier companies leveraging our intelligent matching engine.
          </p>

          <div className="pt-6 space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">Personalized matches</p>
                <p className="text-xs text-muted font-medium">Get roles that align with your unique expertise.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">Verified opportunities</p>
                <p className="text-xs text-muted font-medium">Apply with confidence to pre-vetted employers.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[10px] font-bold uppercase tracking-wider text-muted flex justify-between">
          <span>© 2026 JobSync Inc.</span>
          <span className="space-x-4">
            <Link href="/terms" className="hover:text-primary transition">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition">Privacy</Link>
          </span>
        </div>
      </div>

      {/* Right Column: Form Panel */}
      <div className="lg:col-span-7 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-16 xl:px-24 bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Create account
            </h2>
            <p className="mt-2 text-sm text-muted font-medium">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-primary font-bold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Role Toggle Switcher */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted ml-1">
                  Joining as a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('candidate')}
                    className={`py-3.5 px-4 rounded-2xl border-2 text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
                      role === 'candidate'
                        ? 'bg-primary/5 border-primary text-primary shadow-sm'
                        : 'bg-white border-border text-muted hover:border-primary/30 hover:text-foreground'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Talent</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('employer')}
                    className={`py-3.5 px-4 rounded-2xl border-2 text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
                      role === 'employer'
                        ? 'bg-primary/5 border-primary text-primary shadow-sm'
                        : 'bg-white border-border text-muted hover:border-primary/30 hover:text-foreground'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Partner</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted ml-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`input w-full ${errors.name ? 'border-rose-300' : ''}`}
                  placeholder="e.g. Alex Johnson"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-600 font-bold ml-1">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted ml-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input w-full ${errors.email ? 'border-rose-300' : ''}`}
                  placeholder="name@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-600 font-bold ml-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`input w-full pr-12 ${errors.password ? 'border-rose-300' : ''}`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted hover:text-foreground transition"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-600 font-bold ml-1">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-muted ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`input w-full pr-12 ${errors.confirmPassword ? 'border-rose-300' : ''}`}
                    placeholder="Repeat your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted hover:text-foreground transition"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-600 font-bold ml-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 animate-fade-in">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-bold text-rose-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 border border-transparent text-base font-bold rounded-2xl text-white bg-primary hover:bg-[#008489] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20"
              >
                {isLoading ? (
                  <div className="loading-spinner h-5 w-5 border-white border-t-transparent mr-2" />
                ) : null}
                Create account
              </button>
            </div>

            <div className="text-[10px] font-bold text-muted text-center uppercase tracking-wider px-8 leading-relaxed">
              By joining, you agree to our{' '}
              <Link href="/terms" className="text-foreground hover:text-primary transition underline underline-offset-2">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-foreground hover:text-primary transition underline underline-offset-2">
                Privacy Policy
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
