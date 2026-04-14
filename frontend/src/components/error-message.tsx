'use client'

import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ title = 'Error', message, onRetry }: ErrorMessageProps) {
  return (
    <div className="premium-panel rounded-[26px] border-destructive/20 bg-[linear-gradient(145deg,rgba(239,68,68,0.10),rgba(255,255,255,0.03))] p-5">
      <div className="relative flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="premium-label text-destructive/80">System Alert</div>
            <h4 className="mt-1 text-lg font-black tracking-tight text-foreground">{title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{message}</p>
          </div>
        </div>

        {onRetry && (
          <div className="flex justify-end">
            <Button onClick={onRetry} variant="outline" size="sm" className="rounded-xl">
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
