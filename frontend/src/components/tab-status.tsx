'use client'

import { Check, AlertCircle, Clock } from 'lucide-react'

export type TabStatus = 'complete' | 'pending' | 'loading'

interface TabStatusBadgeProps {
  status: TabStatus
  label: string
  preview?: string
}

export function TabStatusBadge({ status, label, preview }: TabStatusBadgeProps) {
  return (
    <div className="flex items-center gap-2 min-w-max">
      <div className="flex items-center gap-1.5">
        {status === 'complete' && <Check className="h-4 w-4 text-green-500" />}
        {status === 'loading' && <Clock className="h-4 w-4 text-amber-500 animate-spin" />}
        {status === 'pending' && <AlertCircle className="h-4 w-4 text-muted-foreground" />}
        <span className="text-sm">{label}</span>
      </div>
      {preview && <span className="text-xs text-muted-foreground">({preview})</span>}
    </div>
  )
}

interface TabStatusIndicatorProps {
  completedSteps: number
  totalSteps: number
}

export function TabStatusIndicator({ completedSteps, totalSteps }: TabStatusIndicatorProps) {
  const percent = Math.round((completedSteps / totalSteps) * 100)

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-muted-foreground font-medium">{completedSteps}/{totalSteps}</span>
    </div>
  )
}
