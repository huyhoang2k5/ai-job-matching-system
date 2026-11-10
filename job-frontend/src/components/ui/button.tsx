import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-2xl font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
          {
            'bg-primary text-white hover:bg-[#008489] shadow-sm shadow-primary/10': variant === 'primary' || variant === 'default',
            'bg-accent text-foreground hover:bg-[#f0f0f0]': variant === 'secondary',
            'border border-border bg-white hover:bg-accent text-foreground': variant === 'outline',
            'hover:bg-accent text-foreground': variant === 'ghost',
            'bg-rose-500 text-white hover:bg-rose-600': variant === 'destructive',
          },
          {
            'h-9 px-4 text-xs': size === 'sm',
            'h-12 px-8 text-sm': size === 'md',
            'h-14 px-10 text-base': size === 'lg',
          },
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 4.5v0a7.962 7.962 0 00-4.5-5.291z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
