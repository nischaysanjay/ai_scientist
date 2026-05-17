'use client'

import { ChevronDown, Download, ExternalLink, Clock, Star } from 'lucide-react'
import { Paper } from '@/types'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface EnhancedPaperCardProps {
  paper: Paper
  isLoading?: boolean
}

export function EnhancedPaperCard({ paper }: EnhancedPaperCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const savedPapers = localStorage.getItem('saved_papers_list')
      if (savedPapers) {
        const parsed = JSON.parse(savedPapers)
        if (Array.isArray(parsed) && parsed.some((p: Paper) => p.title === paper.title)) {
          setSaved(true)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [paper.title])

  const toggleSave = () => {
    const nextSaved = !saved
    setSaved(nextSaved)
    try {
      const savedPapers = localStorage.getItem('saved_papers_list')
      let parsed: Paper[] = []
      if (savedPapers) {
        const temp = JSON.parse(savedPapers)
        if (Array.isArray(temp)) parsed = temp
      }
      if (nextSaved) {
        if (!parsed.some((p: Paper) => p.title === paper.title)) {
          parsed.push(paper)
        }
      } else {
        parsed = parsed.filter((p: Paper) => p.title !== paper.title)
      }
      localStorage.setItem('saved_papers_list', JSON.stringify(parsed))
      window.dispatchEvent(new Event('saved_papers_updated'))
    } catch (e) {
      console.error(e)
    }
  }

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
    <div className="premium-card rounded-[28px] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_12px_32px_rgba(99,102,241,0.12)] group">
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
          <div className="space-y-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-2 font-bold text-xs text-primary hover:opacity-85 transition-opacity"
            >
              <span>{expanded ? 'Hide Abstract' : 'View Abstract'}</span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
            </button>

            {expanded && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-[22px] border border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground leading-relaxed [html.light_&]:border-border/50 [html.light_&]:bg-black/[0.02]">
                {paper.summary}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 min-w-[120px] rounded-xl"
            onClick={toggleSave}
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
  const [savedCount, setSavedCount] = useState(0)

  const updateSavedCount = () => {
    try {
      const savedPapers = localStorage.getItem('saved_papers_list')
      if (savedPapers) {
        const parsed = JSON.parse(savedPapers)
        if (Array.isArray(parsed)) {
          setSavedCount(parsed.length)
        }
      } else {
        setSavedCount(0)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    updateSavedCount()
    window.addEventListener('saved_papers_updated', updateSavedCount)
    return () => {
      window.removeEventListener('saved_papers_updated', updateSavedCount)
    }
  }, [])

  const handleExportSaved = () => {
    try {
      const savedPapers = localStorage.getItem('saved_papers_list')
      if (!savedPapers) return
      const parsed: Paper[] = JSON.parse(savedPapers)
      if (!Array.isArray(parsed) || parsed.length === 0) return

      let markdown = `# Saved Research Papers Bibliography\n\n`
      markdown += `Generated on: ${new Date().toLocaleString()}\n`
      markdown += `Total Saved Papers: ${parsed.length}\n\n`
      markdown += `---\n\n`

      parsed.forEach((paper, index) => {
        markdown += `### ${index + 1}. ${paper.title}\n`
        if (paper.authors && paper.authors.length > 0) {
          markdown += `- **Authors:** ${paper.authors.join(', ')}\n`
        }
        if (paper.published) {
          markdown += `- **Published Date:** ${new Date(paper.published).toLocaleDateString()}\n`
        }
        if (paper.pdf_url) {
          markdown += `- **PDF Link:** [View PDF Document](${paper.pdf_url})\n`
        }
        if (paper.summary) {
          markdown += `\n**Abstract / Summary:**\n${paper.summary}\n`
        }
        markdown += `\n---\n\n`
      })

      const blob = new Blob([markdown], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `saved_research_bibliography_${new Date().toISOString().slice(0, 10)}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
    }
  }

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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md [html.light_&]:border-border/50 [html.light_&]:bg-white/40">
        <div className="space-y-1">
          <h4 className="text-lg font-black tracking-tight text-foreground">
            Research Bibliography ({papers.length} Papers)
          </h4>
          <p className="text-sm text-muted-foreground">
            {savedCount > 0 
              ? `You have starred ${savedCount} important reference paper${savedCount === 1 ? '' : 's'} for export.`
              : 'Star key papers to add them to your personalized saved bibliography.'}
          </p>
        </div>
        
        {savedCount > 0 && (
          <Button
            onClick={handleExportSaved}
            className="w-full sm:w-auto rounded-xl bg-[linear-gradient(135deg,#7c3aed,#2563eb)] hover:opacity-90 font-black tracking-wide text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-indigo-500/35 cursor-pointer"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Bibliography ({savedCount})
          </Button>
        )}
      </div>

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
    </div>
  )
}
