import * as React from 'react'
import { cn } from '@/lib/cn'

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, className, disabled, onClick, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        ref={ref}
        onClick={(event) => {
          if (!disabled) onCheckedChange?.(!checked)
          onClick?.(event)
        }}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          checked
            ? 'border-primary/40 bg-primary/25 shadow-[0_0_18px_rgba(99,102,241,0.24)]'
            : 'border-transparent bg-slate-300 dark:bg-white/[0.1] shadow-inner',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'absolute left-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-[0_6px_16px_rgba(15,23,42,0.22)] transition-all duration-300',
            checked && 'translate-x-5 bg-primary-foreground'
          )}
        />
      </button>
    )
  }
)

Switch.displayName = 'Switch'

export { Switch }
