'use client'

import { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'

interface EmptyTabStateProps {
  icon: ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyTabState({ icon, title, description, actionLabel, onAction }: EmptyTabStateProps) {
  return (
    <div className="relative overflow-hidden premium-card rounded-[32px] p-12 text-center border border-primary/10 bg-gradient-to-b from-primary/[0.02] to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] animate-reveal">
      {/* Dynamic ambient mesh glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      
      <div className="relative flex flex-col items-center gap-6 z-10">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_8px_30px_rgba(139,92,246,0.12)]">
          {/* Rotating dashed scientific spinner */}
          <div className="absolute -inset-2 rounded-[20px] border border-dashed border-primary/30 animate-spin-slow pointer-events-none" />
          {icon}
        </div>
        
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-xl font-black tracking-tight text-foreground flex items-center justify-center gap-2">
            {title}
            <Sparkles className="h-4 w-4 text-primary/80 animate-pulse" />
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="mt-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider text-primary border border-primary/35 bg-primary/10 hover:bg-primary/20 transition-all duration-300 shadow-[0_4px_16px_rgba(139,92,246,0.1)] cursor-pointer"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
