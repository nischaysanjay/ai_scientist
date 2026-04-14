'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { showErrorToast, showSuccessToast } from '@/lib/toast'

interface ResultSectionProps {
  title: string
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
  actions?: React.ReactNode
  contentToCopy?: string
}

function renderInlineMarkdown(line: string): React.ReactNode[] {
  const segments: React.ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      segments.push(line.slice(lastIndex, match.index))
    }

    const token = match[0]
    if (token.startsWith('**') && token.endsWith('**')) {
      segments.push(
        <strong key={`${match.index}-bold`} className="text-primary font-bold">
          {token.slice(2, -2)}
        </strong>
      )
    } else {
      segments.push(
        <em key={`${match.index}-italic`} className="text-muted-foreground">
          {token.slice(1, -1)}
        </em>
      )
    }

    lastIndex = match.index + token.length
  }

  if (lastIndex < line.length) {
    segments.push(line.slice(lastIndex))
  }

  return segments.length > 0 ? segments : [line]
}

export function ResultSection({
  title,
  children,
  icon,
  className,
  actions,
  contentToCopy,
}: ResultSectionProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!contentToCopy) return

    try {
      await navigator.clipboard.writeText(contentToCopy)
      setCopied(true)
      showSuccessToast('Copied', 'Content copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showErrorToast('Copy Failed', 'Clipboard access was unavailable.')
    }
  }

  return (
    <div className={cn(
      'premium-panel rounded-[30px] p-6 transition-all duration-300 hover:-translate-y-0.5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4',
      className
    )}>
      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <div>
            <div className="premium-label">Result</div>
            <h3 className="text-xl font-black tracking-tight text-foreground">{title}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actions}
          {contentToCopy && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        {children}
      </div>
    </div>
  )
}

export function ResultContent({ content }: { content: string }) {
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-xl border border-dashed">
        <p className="text-sm text-muted-foreground italic">
          No analysis data available yet.
        </p>
      </div>
    )
  }

  const paragraphs = content.split('\n\n').filter((p) => p.trim())

  return (
    <div className="space-y-6 text-sm leading-relaxed text-foreground/90">
      {paragraphs.map((paragraph, i) => (
        <div key={i} className="space-y-1">
          {paragraph.split('\n').map((line, j) => {
            const trimmed = line.trim()
            const isListItem = trimmed.startsWith('- ') || trimmed.startsWith('* ')
            const displayText = isListItem ? trimmed.substring(2) : line

            return (
              <p
                key={j}
                className={cn(
                  'transition-colors hover:text-foreground',
                  isListItem ? 'pl-4 text-muted-foreground' : ''
                )}
              >
                {isListItem ? <span className="mr-2">-</span> : null}
                {renderInlineMarkdown(displayText)}
              </p>
            )
          })}
        </div>
      ))}
    </div>
  )
}
