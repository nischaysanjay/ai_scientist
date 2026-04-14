import { ReactNode } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/lib/theme-provider'

/**
 * Root providers wrapper for the entire app
 * Initializes all contexts and providers
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster />
    </ThemeProvider>
  )
}
