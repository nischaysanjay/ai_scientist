'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

interface LoadingSkeletonProps {
  count?: number
  height?: string
}

export function LoadingSkeleton({ count = 1, height = 'h-12' }: LoadingSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn(height, 'premium-card rounded-2xl animate-pulse')} />
      ))}
    </div>
  )
}

interface LoadingSpinnerProps {
  className?: string
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <Loader2 className={cn('h-4 w-4 animate-spin', className)} />
  )
}

export function ResultSkeleton() {
  return (
    <div className="space-y-4">
      <LoadingSkeleton count={3} height="h-5" />
      <div className="space-y-2">
        <LoadingSkeleton height="h-3" />
        <LoadingSkeleton height="h-3 w-5/6" />
      </div>
    </div>
  )
}
