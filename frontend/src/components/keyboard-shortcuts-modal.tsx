'use client'

import { Command, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const shortcuts = [
    {
      keys: ['Cmd', 'Enter'],
      description: 'Run workflow',
      platform: 'mac',
    },
    {
      keys: ['Ctrl', 'Enter'],
      description: 'Run workflow',
      platform: 'win',
    },
    {
      keys: ['Cmd', 'E'],
      description: 'Export results',
      platform: 'mac',
    },
    {
      keys: ['Ctrl', 'E'],
      description: 'Export results',
      platform: 'win',
    },
    {
      keys: ['?'],
      description: 'Show this help modal',
      platform: 'both',
    },
  ]

  const isMac = typeof window !== 'undefined' && (
    /Macintosh|Mac OS X|iPhone|iPad|iPod/.test(navigator.userAgent)
  )

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md [html.light_&]:bg-slate-950/35"
        onClick={onClose}
      />

      <div className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2">
        <div className="premium-panel rounded-[32px] p-8 animate-in zoom-in-95 fade-in duration-200">
          <div className="relative space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                  <Command className="h-5 w-5" />
                </div>
                <div>
                  <div className="premium-label">Command Palette</div>
                  <h2 className="text-2xl font-black tracking-tight text-foreground">Keyboard Shortcuts</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Press Esc to close</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {shortcuts
                .filter((s) => s.platform === 'both' || (isMac && s.platform === 'mac') || (!isMac && s.platform === 'win'))
                .map((shortcut, idx) => (
                  <div key={idx} className="premium-card rounded-[22px] p-4">
                    <div className="relative flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-foreground">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <div key={keyIdx} className="flex items-center gap-1">
                            <kbd className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 font-mono text-xs font-semibold text-foreground [html.light_&]:border-border/50 [html.light_&]:bg-white/75">
                              {key}
                            </kbd>
                            {keyIdx < shortcut.keys.length - 1 && (
                              <span className="px-1 text-xs text-muted-foreground">+</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="premium-card rounded-[22px] px-4 py-3">
              <div className="relative text-center text-sm text-muted-foreground">
                Tip: Shortcuts work best when no text input is focused.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
