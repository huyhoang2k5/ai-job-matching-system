'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const { login, isLoading, error, clearError } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      // Error is handled in store
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left Column: Brand & Info (Visible on LG screens) */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 bg-accent relative overflow-hidden border-r border-border">
        {/* Subtle abstract patterns */}
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

        {/* Logo / Brand Name */}
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

        {/* Hero Copy */}
        <div className="relative z-10 my-auto space-y-8">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white text-primary border border-primary/10">
            ✨ Next-Gen Recruitment
          </span>
          <h1 className="text-4xl font-bold tracking-tight leading-tight text-foreground">
            Connect with your <br />
            <span className="text-primary">dream career</span> today.
          </h1>
          <p className="text-muted text-base leading-relaxed max-w-sm font-medium">
            Join thousands of professionals finding their perfect role through our intelligent matching platform.
          </p>

          <div className="pt-6 space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">Smart matching</p>
                <p className="text-xs text-muted font-medium">Auto-extracted expertise for precise alignment.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">Direct connection</p>
                <p className="text-xs text-muted font-medium">Skip the middleman and chat with HR instantly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
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
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-muted font-medium">
              New to our platform?{' '}
              <Link
                href="/auth/register"
                className="text-primary font-bold hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
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
                  className="input w-full"
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-bold text-muted hover:text-primary transition"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input w-full pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted hover:text-foreground transition"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
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

            <div className="flex items-center px-1">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4.5 w-4.5 text-primary focus:ring-primary/20 border-border rounded-md cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-muted cursor-pointer">
                Keep me signed in
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 border border-transparent text-base font-bold rounded-2xl text-white bg-primary hover:bg-[#008489] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20"
              >
                {isLoading ? (
                  <div className="loading-spinner h-5 w-5 border-white border-t-transparent mr-2" />
                ) : null}
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
 }
