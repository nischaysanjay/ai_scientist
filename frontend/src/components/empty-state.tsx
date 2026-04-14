'use client'

import { Sparkles, BookOpen, CheckCircle2, Search } from 'lucide-react'

interface EmptyStateProps {
  onSelectExample?: (topic: string) => void
}

export function EmptyState({ onSelectExample }: EmptyStateProps) {
  const examples = [
    'Machine Learning in Oncology',
    'Quantum Computing Applications',
    'CRISPR Gene Editing Ethics',
    'Neural Architecture Search',
  ]

  const features = [
    'Research Papers',
    'Gap Analysis',
    'Novel Hypotheses',
    'Validation Metrics',
    'CDM + NDI Scoring',
  ]

  return (
    <div className="premium-panel rounded-[34px] p-8 sm:p-12 text-center animate-reveal fill-mode-both">
      <div className="premium-grid absolute inset-0 opacity-35" />
      <div className="relative space-y-10">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-primary/20 bg-primary/10 text-primary shadow-[0_18px_50px_rgba(99,102,241,0.18)]">
              <Sparkles className="h-9 w-9" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="premium-label">Scientific Workflow</div>
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
              Run a cleaner, sharper research pipeline
            </h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
              Discover literature, surface gaps, generate hypotheses, and validate them with a workflow designed to feel like a premium research cockpit.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { icon: <BookOpen className="h-5 w-5" />, title: 'Search Papers', detail: 'Pull a focused corpus from relevant academic sources.' },
            { icon: <Search className="h-5 w-5" />, title: 'Analyze Evidence', detail: 'Extract patterns, summaries, and hidden research gaps.' },
            { icon: <CheckCircle2 className="h-5 w-5" />, title: 'Validate Results', detail: 'Score hypotheses with CDM and NDI confidence signals.' },
          ].map((item) => (
            <div key={item.title} className="premium-card rounded-[24px] p-5 text-left rise-in" style={{ animationDelay: `${100 + 120 * ['Search Papers', 'Analyze Evidence', 'Validate Results'].indexOf(item.title)}ms` }}>
              <div className="relative space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <div className="premium-label">Try a Research Topic</div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {examples.map((example) => (
              <button
                key={example}
                onClick={() => onSelectExample?.(example)}
                className="premium-card rounded-[22px] px-5 py-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-primary/[0.06] rise-in group"
                style={{ animationDelay: `${400 + examples.indexOf(example) * 100}ms` }}
              >
                <div className="relative flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-foreground">{example}</span>
                  <Sparkles className="h-4 w-4 text-primary/80 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="premium-label">Core Features</div>
          <div className="flex flex-wrap justify-center gap-3">
            {features.map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground rise-in"
                style={{ animationDelay: `${700 + features.indexOf(feature) * 70}ms` }}
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
