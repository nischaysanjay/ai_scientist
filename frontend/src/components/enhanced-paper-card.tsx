'use client'

import { ChevronDown, Download, ExternalLink, Clock, Star } from 'lucide-react'
import { Paper } from '@/types'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface EnhancedPaperCardProps {
  paper: Paper
  isLoading?: boolean
}

export function EnhancedPaperCard({ paper }: EnhancedPaperCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [saved, setSaved] = useState(false)

  const getYear = (dateString?: string) => {
    if (!dateString) return null
    try {
      return new Date(dateString).getFullYear()
    } catch {
      return null
    }
  }

  const year = getYear(paper.published)

  return (
    <div className="premium-card rounded-[28px] p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-primary/20 group">
      <div className="relative space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="premium-label">Research Paper</div>
            <h3 className="text-xl font-black leading-tight tracking-tight text-foreground">
              {paper.title}
            </h3>
            {paper.authors && paper.authors.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {paper.authors.slice(0, 3).join(', ')}
                {paper.authors.length > 3 && ` +${paper.authors.length - 3}`}
              </p>
            )}
          </div>

          {year && (
            <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-black tracking-[0.18em] text-primary transition-transform duration-300 group-hover:scale-105">
              {year}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {paper.published && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 transition-colors duration-300 group-hover:bg-white/[0.07] [html.light_&]:border-border/50 [html.light_&]:bg-white/75 [html.light_&]:group-hover:bg-white">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>{new Date(paper.published).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {paper.summary && (
          <div className="rounded-[22px] border border-border/40 bg-muted/20 dark:bg-black/10 p-4">
            <div className="relative space-y-3">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-foreground/88 transition-colors hover:text-foreground"
              >
                <span>{expanded ? 'Hide abstract' : 'Show abstract'}</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
              </button>

              {expanded && (
                <div className="rounded-2xl border border-white/8 bg-black/10 p-4 text-sm leading-relaxed text-muted-foreground [html.light_&]:border-border/50 [html.light_&]:bg-white/70">
                  {paper.summary}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 min-w-[120px] rounded-xl"
            onClick={() => setSaved(!saved)}
          >
            <Star className={`mr-2 h-4 w-4 ${saved ? 'fill-amber-400 text-amber-400' : ''}`} />
            {saved ? 'Saved' : 'Save'}
          </Button>

          {paper.pdf_url && (
            <Button
              size="sm"
              className="flex-1 min-w-[120px] rounded-xl"
              onClick={() => window.open(paper.pdf_url, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View PDF
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

interface EnhancedPaperListProps {
  papers: Paper[]
  isLoading?: boolean
}


export function EnhancedPaperList({ papers, isLoading }: EnhancedPaperListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="premium-panel rounded-[28px] p-6 animate-pulse">
            <div className="relative space-y-4">
              <div className="h-4 w-24 rounded-full bg-muted/50" />
              <div className="h-8 w-3/4 rounded-2xl bg-muted/60" />
              <div className="h-4 w-1/2 rounded-xl bg-muted/50" />
              <div className="h-24 rounded-[22px] bg-muted/40" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {papers.map((paper, idx) => (
        <div
          key={`${paper.title}-${idx}`}
          className="animate-reveal fill-mode-both"
          style={{ animationDelay: `${idx * 120}ms` }}
        >
          <EnhancedPaperCard paper={paper} />
        </div>
      ))}
    </div>
  )
}
