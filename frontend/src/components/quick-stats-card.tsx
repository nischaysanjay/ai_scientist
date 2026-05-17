'use client'

import { BarChart3, Clock, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { WorkflowStep } from '@/lib/store'

interface QuickStatsCardProps {
  papersFound: number
  currentStep: WorkflowStep
  isLoading: boolean
  estimatedTime?: string
}

export function QuickStatsCard({ papersFound, currentStep, isLoading, estimatedTime }: QuickStatsCardProps) {
  const isComplete = currentStep === 'complete'
  const isIdle = currentStep === 'idle' && !isLoading
  const statusLabel = isComplete ? 'Complete' : isIdle ? 'Ready' : 'In Progress'
  const statusTone = isComplete
    ? 'bg-emerald-400 text-emerald-400'
    : isIdle
      ? 'bg-slate-400 text-slate-400'
      : 'bg-cyan-400 text-cyan-400'

  return (
    <div className="premium-panel rounded-[26px] p-5 rise-in">
      <div className="relative space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="premium-label">Session Snapshot</div>
            <h3 className="text-lg font-black tracking-tight text-foreground">Research Status</h3>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="premium-card rounded-2xl px-4 py-3 rise-in" style={{ animationDelay: '80ms' }}>
            <div className="relative flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground/70">Papers Found</span>
              <span className="text-2xl font-black tracking-tight text-foreground">{papersFound}</span>
            </div>
          </div>

          {estimatedTime && (
            <div className="premium-card rounded-2xl px-4 py-3 rise-in" style={{ animationDelay: '150ms' }}>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground/70">Est. Time</span>
                </div>
                <span className="text-sm font-bold text-foreground">{estimatedTime}</span>
              </div>
            </div>
          )}

          <div className="premium-card rounded-2xl px-4 py-3 rise-in" style={{ animationDelay: '220ms' }}>
            <div className="relative flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground/70">Status</span>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex h-2.5 w-2.5 rounded-full shadow-[0_0_14px_currentColor]',
                    statusTone
                  )}
                />
                <span className="text-sm font-bold text-foreground">
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {isComplete && papersFound > 0 && (
          <div className="premium-card rounded-2xl px-4 py-3 rise-in" style={{ animationDelay: '300ms' }}>
            <div className="relative flex items-center gap-3 text-emerald-300 [html.light_&]:text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-semibold">Results are ready to explore</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
