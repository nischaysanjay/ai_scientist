'use client'

import { useEffect, useRef, useState } from 'react'
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

function getLineKind(line: string) {
  const trimmed = line.trim()
  const heading = trimmed.match(/^(#{1,3})\s+(.+)$/)
  const numbered = trimmed.match(/^(\d+)[.)]\s+(.+)$/)
  const bullet = trimmed.match(/^[-*]\s+(.+)$/)
  const quote = trimmed.match(/^>\s+(.+)$/)

  return { trimmed, heading, numbered, bullet, quote }
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
      'premium-panel rounded-[30px] p-6 transition-all duration-300 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4',
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

function CopyBlock({ text, children, isStreaming }: { text: string, children: React.ReactNode, isStreaming?: boolean }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="group relative pr-8">
      {children}
      {!isStreaming && (
        <button
          onClick={handleCopy}
          className="absolute top-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary"
          title="Copy section"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  )
}

export function ResultContent({
  content,
  isStreaming = false,
}: {
  content: string
  isStreaming?: boolean
}) {
  const endRef = useRef<HTMLSpanElement | null>(null)
  const autoScrollEnabled = useRef(true)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (maxScroll - scrollY < 150) {
        autoScrollEnabled.current = true
      } else {
        autoScrollEnabled.current = false
      }
    }

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) {
        autoScrollEnabled.current = false
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('wheel', handleWheel, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [])

  useEffect(() => {
    if (!isStreaming) return
    if (autoScrollEnabled.current) {
      endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [content, isStreaming])

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-xl border border-dashed">
        <p className="text-sm text-muted-foreground italic">
          No analysis data available yet.
        </p>
      </div>
    )
  }

  const blocks = content.split('\n\n').filter((p) => p.trim())

  return (
    <div className="space-y-6 text-sm leading-relaxed text-foreground/90">
      {blocks.map((block, i) => {
        const lines = block.split('\n').filter((line) => line.trim())
        const firstLineKind = getLineKind(lines[0] ?? '')
        const isListBlock = lines.every((line) => {
          const kind = getLineKind(line)
          return kind.bullet || kind.numbered
        })

        if (firstLineKind.heading) {
          const [, level, text] = firstLineKind.heading
          const HeadingTag = level.length === 1 ? 'h3' : level.length === 2 ? 'h4' : 'h5'

          return (
            <CopyBlock key={i} text={block} isStreaming={isStreaming}>
              <div className="space-y-2">
                <HeadingTag className="pt-1 text-base font-black tracking-tight text-foreground">
                  {renderInlineMarkdown(text)}
                </HeadingTag>
                {lines.slice(1).map((line, j) => (
                  <p key={j} className="text-muted-foreground">
                    {renderInlineMarkdown(line)}
                  </p>
                ))}
              </div>
            </CopyBlock>
          )
        }

        if (isListBlock) {
          return (
            <CopyBlock key={i} text={block} isStreaming={isStreaming}>
              <div className="space-y-2">
                {lines.map((line, j) => {
                  const kind = getLineKind(line)
                  const marker = kind.numbered?.[1] ? `${kind.numbered[1]}.` : '-'
                  const text = kind.numbered?.[2] ?? kind.bullet?.[1] ?? line

                  return (
                    <div key={j} className="grid grid-cols-[1.5rem_1fr] gap-2 text-muted-foreground">
                      <span className="text-right font-bold text-primary/80">{marker}</span>
                      <p className="min-w-0">{renderInlineMarkdown(text)}</p>
                    </div>
                  )
                })}
              </div>
            </CopyBlock>
          )
        }

        return (
          <CopyBlock key={i} text={block} isStreaming={isStreaming}>
            <div className="space-y-1">
              {lines.map((line, j) => {
                const kind = getLineKind(line)

                if (kind.quote) {
                  return (
                    <blockquote
                      key={j}
                      className="border-l-2 border-primary/40 pl-4 text-muted-foreground"
                    >
                      {renderInlineMarkdown(kind.quote[1])}
                    </blockquote>
                  )
                }

                return (
                  <p key={j} className="transition-colors hover:text-foreground">
                    {renderInlineMarkdown(line)}
                  </p>
                )
              })}
            </div>
          </CopyBlock>
        )
      })}
      {isStreaming && (
        <span
          ref={endRef}
          className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse rounded-sm bg-primary/80"
          aria-hidden="true"
        />
      )}
    </div>
  )
}
