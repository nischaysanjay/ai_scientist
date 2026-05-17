'use client'

import {
  Search,
  FileText,
  BarChart3,
  Lightbulb,
  Zap,
  Brain,
  CheckCircle2,
  Check,
} from 'lucide-react'
import { WorkflowStep } from '@/lib/store'
import { cn } from '@/lib/cn'
import { useTheme } from '@/lib/theme-provider'

interface Step {
  key: WorkflowStep
  label: string
  detail: string
  icon: React.ReactNode
}

const STEPS: Step[] = [
  { key: 'searching', label: 'Search', detail: 'Discovering papers', icon: <Search className="h-4 w-4" /> },
  { key: 'processing', label: 'Process', detail: 'Extracting evidence', icon: <FileText className="h-4 w-4" /> },
  { key: 'summarizing', label: 'Summarize', detail: 'Synthesizing corpus', icon: <BarChart3 className="h-4 w-4" /> },
  { key: 'analyzing-gaps', label: 'Gaps', detail: 'Finding openings', icon: <Lightbulb className="h-4 w-4" /> },
  { key: 'generating-hypotheses', label: 'Hypotheses', detail: 'Generating claims', icon: <Brain className="h-4 w-4" /> },
  { key: 'planning-experiment', label: 'Plan', detail: 'Designing tests', icon: <Zap className="h-4 w-4" /> },
  { key: 'validating', label: 'Validate', detail: 'Scoring CDM + NDI', icon: <CheckCircle2 className="h-4 w-4" /> },
]

interface WorkflowProgressProps {
  currentStep: WorkflowStep
  isComplete: boolean
}

const STEP_LABELS: Record<WorkflowStep, string> = {
  idle: 'Ready',
  searching: 'Searching',
  processing: 'Processing',
  summarizing: 'Summarizing',
  'analyzing-gaps': 'Detecting Gaps',
  'generating-hypotheses': 'Forming Hypotheses',
  'planning-experiment': 'Planning',
  validating: 'Validating',
  complete: 'Complete',
}

export function WorkflowProgress({ currentStep, isComplete }: WorkflowProgressProps) {
  const { effectiveTheme } = useTheme()
  const isLight = effectiveTheme === 'light'
  const currentIndex = STEPS.findIndex((step) => step.key === currentStep)
  const progressPercent = isComplete ? 100 : currentIndex < 0 ? 0 : ((currentIndex + 1) / STEPS.length) * 100
  const activeStep = isComplete
    ? { label: 'Complete', detail: 'All research stages finished successfully.' }
    : currentIndex >= 0
      ? STEPS[currentIndex]
      : { label: 'Ready', detail: 'Waiting to begin the research workflow.' }

  const visibleStageCount = isComplete ? STEPS.length : currentIndex < 0 ? 0 : currentIndex + 1

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_14px_48px_rgba(15,23,42,0.22)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.12),transparent_28%)]" />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_18px_rgba(99,102,241,0.85)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.38em] text-muted-foreground/75">
                Research Pipeline
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black tracking-tight text-foreground">
                {isComplete ? 'Analysis Complete' : STEP_LABELS[currentStep]}
              </h3>
              <p className="text-sm text-muted-foreground">
                {activeStep.detail}
              </p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-6 lg:justify-end">
            <div className="space-y-1 text-right">
              <div className="text-[10px] font-black uppercase tracking-[0.32em] text-muted-foreground/65">
                Progress
              </div>
              <div className="text-2xl font-black tracking-tight text-foreground">
                {Math.round(progressPercent)}%
              </div>
            </div>
            <div className="min-w-[96px] rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-right backdrop-blur-md">
              <div className="text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground/60">
                Stage
              </div>
              <div className="text-sm font-bold text-foreground">
                {visibleStageCount}/{STEPS.length}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative h-3 overflow-hidden rounded-full border border-white/10 bg-black/20 shadow-inner">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03),transparent)]" />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,rgba(99,102,241,0.95),rgba(129,140,248,0.95)_35%,rgba(34,211,238,0.95))] shadow-[0_0_28px_rgba(99,102,241,0.35)] transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.24),transparent)] shine-slow" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground/60">
            <span>Pipeline status</span>
            <span>{isComplete ? 'Complete' : 'In progress'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentIndex || isComplete
            const isCurrent = step.key === currentStep && !isComplete
            const isPending = !isCompleted && !isCurrent

            return (
              <div
                key={step.key}
                className={cn(
                  'relative overflow-hidden rounded-2xl border px-4 py-4 backdrop-blur-md transition-all duration-500',
                  isCompleted && 'border-primary/25 bg-primary/[0.08] shadow-[0_10px_30px_rgba(99,102,241,0.10)]',
                  isCurrent && (isLight
                    ? 'border-sky-300 bg-sky-100/95 shadow-[0_16px_32px_rgba(56,189,248,0.16)]'
                    : 'border-cyan-300/35 bg-[linear-gradient(145deg,rgba(99,102,241,0.18),rgba(34,211,238,0.12))] shadow-[0_14px_36px_rgba(34,211,238,0.10)]'),
                  isPending && (isLight
                    ? 'border-slate-200 bg-white/90'
                    : 'border-white/8 bg-white/[0.03]')
                )}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-70" />

                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-500',
                      isCompleted && 'border-primary/30 bg-primary/15 text-primary',
                      isCurrent && (isLight
                        ? 'border-sky-300 bg-white text-slate-900 shadow-[0_8px_18px_rgba(56,189,248,0.18)]'
                        : 'border-cyan-300/35 bg-white/10 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.18)]'),
                      isPending && (isLight
                        ? 'border-slate-200 bg-slate-50 text-slate-700'
                        : 'border-white/10 bg-black/10 text-muted-foreground/55')
                    )}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : step.icon}
                  </div>

                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[0.22em]',
                      isCompleted && 'bg-primary/10 text-primary',
                      isCurrent && (isLight ? 'bg-white text-slate-900' : 'bg-cyan-400/10 text-cyan-200'),
                      isPending && (isLight ? 'bg-slate-100 text-slate-700' : 'bg-white/5 text-muted-foreground/55')
                    )}
                  >
                    {isCompleted ? 'Done' : isCurrent ? 'Live' : 'Queued'}
                  </span>
                </div>

                <div className="mt-4 space-y-1">
                  <div
                    className={cn(
                      'text-sm font-bold tracking-tight',
                      isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground/70'
                    )}
                  >
                    {step.label}
                  </div>
                  <div className="text-[11px] leading-relaxed text-muted-foreground/75">
                    {step.detail}
                  </div>
                </div>

                {isCurrent && (
                  <div className="mt-4 flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex h-2 w-2 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.85)]',
                        isLight ? 'bg-sky-500' : 'bg-cyan-300'
                      )}
                    />
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-[0.2em]',
                        isLight ? 'text-slate-900' : 'text-cyan-200/90'
                      )}
                    >
                      Active now
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
