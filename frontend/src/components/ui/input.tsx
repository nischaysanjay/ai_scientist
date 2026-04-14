import * as React from 'react'
import { cn } from '@/lib/cn'

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-2xl border border-border/40 bg-transparent px-4 py-2 text-sm text-foreground shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md ring-offset-background placeholder:text-muted-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
