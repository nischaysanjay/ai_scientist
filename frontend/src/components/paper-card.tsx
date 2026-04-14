'use client'

import { Paper } from '@/types'
import { ExternalLink, Users, Calendar } from 'lucide-react'
import { cn } from '@/lib/cn'

interface PaperCardProps {
  paper: Paper
  number: number
  isLoading?: boolean
}

export function PaperCard({ paper, number, isLoading }: PaperCardProps) {
  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 space-y-3 bg-card animate-pulse">
        <div className="h-6 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
      </div>
    )
  }

  return (
    <div className={cn(
      "border rounded-lg p-4 hover:bg-muted/50 transition-colors space-y-3 bg-card"
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
          {number}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight text-foreground break-words">
            {paper.title}
          </h3>
        </div>
      </div>

      {paper.authors && paper.authors.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{paper.authors.slice(0, 2).join(', ')}</span>
          {paper.authors.length > 2 && <span>+{paper.authors.length - 2} more</span>}
        </div>
      )}

      {paper.published && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span>{new Date(paper.published).getFullYear()}</span>
        </div>
      )}

      {paper.summary && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {paper.summary}
        </p>
      )}

      <div className="pt-2">
        <a
          href={paper.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          View PDF
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}

interface PaperListProps {
  papers: Paper[]
  isLoading: boolean
}

export function PaperList({ papers, isLoading }: PaperListProps) {
  if (isLoading && papers.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <PaperCard key={i} paper={{} as Paper} number={i + 1} isLoading />
        ))}
      </div>
    )
  }

  if (papers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No papers found. Click &quot;Run AI Scientist&quot; to search.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {papers.map((paper, index) => (
        <PaperCard key={index} paper={paper} number={index + 1} />
      ))}
    </div>
  )
}
