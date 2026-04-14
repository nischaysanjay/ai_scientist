'use client'

import { useEffect } from 'react'

interface KeyboardShortcuts {
  onRun?: () => void
  onExport?: () => void
  onHelp?: () => void
}

export function useKeyboardShortcuts({ onRun, onExport, onHelp }: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter = Run
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        onRun?.()
      }

      // Ctrl/Cmd + E = Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault()
        onExport?.()
      }

      // ? = Show help
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        onHelp?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onRun, onExport, onHelp])
}
