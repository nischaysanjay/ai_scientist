'use client'

import { useEffect, useState } from 'react'
import { useWorkflowStore } from '@/lib/store'
import { cn } from '@/lib/cn'
import { 
  History, 
  Trash2, 
  BookOpen, 
  Calendar, 
  Sparkles,
  ChevronDown, 
  ChevronUp, 
  FolderOpen 
} from 'lucide-react'

export function HistoryPanel() {
  const {
    sessions,
    activeSessionId,
    loadAllSessionsFromStorage,
    loadSession,
    deleteSession,
    isLoading,
    currentStep
  } = useWorkflowStore()

  const [isOpen, setIsOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
      loadAllSessionsFromStorage()
    }, 0)
    return () => clearTimeout(timer)
  }, [loadAllSessionsFromStorage])

  if (!mounted) return null

  const isWorkflowActive = isLoading || (currentStep !== 'idle' && currentStep !== 'complete')

  // Helper to format date nicely
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Helper for validation badge styling
  const getValidationBadgeStyles = (classification: string | undefined | null) => {
    switch (classification) {
      case 'Strong & Novel':
        return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'
      case 'Novel but Weak':
        return 'border-amber-500/20 bg-amber-500/10 text-amber-500 dark:text-amber-400'
      case 'Stable but Known':
        return 'border-blue-500/20 bg-blue-500/10 text-blue-500 dark:text-blue-400'
      case 'Weak & Redundant':
        return 'border-rose-500/20 bg-rose-500/10 text-rose-500 dark:text-rose-400'
      default:
        return 'border-muted bg-muted/30 text-muted-foreground'
    }
  }

  return (
    <div className="premium-panel rounded-[30px] p-6 animate-reveal [animation-delay:200ms] overflow-hidden">
      <div className="space-y-4">
        {/* Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <History className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="premium-label">Research Archive</div>
              <h3 className="text-sm font-bold text-foreground">Previous Sessions</h3>
            </div>
          </div>
          <div className="text-muted-foreground hover:text-foreground transition-colors p-1">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </button>

        {/* Sessions List */}
        {isOpen && (
          <div className="space-y-3 pt-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-[20px] border border-border/40 bg-muted/10 dark:border-white/5">
                <FolderOpen className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-xs text-muted-foreground/80 font-medium">No saved research sessions found</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">Completed runs are saved automatically</p>
              </div>
            ) : (
              sessions.map((session) => {
                const isActive = activeSessionId === session.id
                const classification = session.validationResult?.classification

                return (
                  <div
                    key={session.id}
                    className={cn(
                      "group relative premium-card rounded-[22px] p-4 transition-all duration-300 border-glow",
                      isActive ? "border-primary/50 bg-primary/[0.04] shadow-[0_0_12px_rgba(139,92,246,0.15)]" : "hover:border-border-hover",
                      isWorkflowActive && "opacity-60 pointer-events-none hover:shadow-none"
                    )}
                  >
                    <div className="space-y-3">
                      {/* Session Metadata Row */}
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground/85">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="h-3 w-3 text-primary/70" />
                          <span>{formatDate(session.timestamp)}</span>
                        </div>
                        <span className="font-semibold uppercase tracking-wider bg-secondary px-2 py-0.5 rounded-md text-[9px]">
                          {session.modelName}
                        </span>
                      </div>

                      {/* Topic title */}
                      <h4 className="text-xs font-extrabold tracking-tight text-foreground line-clamp-2 leading-relaxed group-hover:text-primary transition-colors duration-250">
                        {session.topic}
                      </h4>

                      {/* Details & Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Number of papers badge */}
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/75 bg-muted/40 px-2 py-0.5 rounded-md font-medium">
                          <BookOpen className="h-3 w-3 text-muted-foreground/60" />
                          <span>{session.papers?.length || 0} papers</span>
                        </div>

                        {/* Validation Outcome Badge */}
                        {classification && (
                          <div className={cn(
                            "flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-md font-extrabold border uppercase tracking-wider",
                            getValidationBadgeStyles(classification)
                          )}>
                            <Sparkles className="h-2.5 w-2.5" />
                            <span>{classification}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions Footer */}
                      <div className="flex items-center justify-end gap-2 pt-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSession(session.id)
                          }}
                          disabled={isWorkflowActive}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all duration-200"
                          title="Delete research session"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        
                        <button
                          onClick={() => loadSession(session.id)}
                          disabled={isWorkflowActive || isActive}
                          className={cn(
                            "text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all duration-200",
                            isActive 
                              ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                              : "bg-primary text-primary-foreground hover:bg-primary/95 hover:scale-[1.02] shadow-[0_2px_8px_rgba(139,92,246,0.25)] border border-primary/20"
                          )}
                        >
                          {isActive ? 'Loaded' : 'Load Run'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
