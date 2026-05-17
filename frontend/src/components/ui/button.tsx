import * as React from 'react'
import { cn } from '@/lib/cn'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

    const variants = {
      default: 'border border-primary/30 bg-[linear-gradient(135deg,rgba(139,92,246,0.92),rgba(168,85,247,0.88)_45%,rgba(217,70,239,0.72))] text-primary-foreground shadow-[0_14px_32px_rgba(139,92,246,0.26)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(139,92,246,0.30)]',
      destructive: 'border border-destructive/35 bg-[linear-gradient(135deg,rgba(239,68,68,0.92),rgba(220,38,38,0.88))] text-destructive-foreground shadow-[0_14px_32px_rgba(239,68,68,0.22)] hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(239,68,68,0.26)]',
      outline: 'border border-white/10 bg-white/[0.04] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/[0.08] [html.light_&]:border-border/50 [html.light_&]:bg-white/70 [html.light_&]:shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]',
      secondary: 'border border-white/10 bg-white/[0.05] text-foreground shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur-md hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] [html.light_&]:border-border/50 [html.light_&]:bg-white/80 [html.light_&]:shadow-[0_10px_24px_rgba(88,99,135,0.10)] [html.light_&]:hover:border-primary/25 [html.light_&]:hover:bg-white',
      ghost: 'border border-transparent text-foreground/88 hover:border-white/10 hover:bg-white/[0.05] hover:text-foreground [html.light_&]:hover:border-border/50 [html.light_&]:hover:bg-muted/70',
      link: 'text-primary underline-offset-4 hover:underline',
    }

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 px-3.5 text-xs',
      lg: 'h-12 px-8 text-sm',
      icon: 'h-10 w-10',
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
