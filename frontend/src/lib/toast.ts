/**
 * Toast notification utilities
 * Uses the shadcn/ui toast system
 */

import { toast } from '@/components/ui/use-toast'

export function showSuccessToast(title: string, description?: string) {
  toast({
    title,
    description,
    variant: 'default',
    duration: 3000,
  })
}

export function showErrorToast(title: string, description?: string) {
  toast({
    title,
    description,
    variant: 'destructive',
    duration: 5000,
  })
}

export function showLoadingToast(title: string, description?: string) {
  return toast({
    title,
    description,
    variant: 'default',
    duration: 0, // Doesn't auto-dismiss
  })
}

export function showInfoToast(title: string, description?: string) {
  toast({
    title,
    description,
    variant: 'default',
    duration: 4000,
  })
}
