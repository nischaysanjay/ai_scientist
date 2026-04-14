import * as React from 'react'
import { cn } from '@/lib/cn'

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        'flex min-h-[110px] w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md ring-offset-background placeholder:text-muted-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary/35 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'

export { Textarea }
