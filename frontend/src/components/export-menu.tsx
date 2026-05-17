'use client'

import { Download, FileText, Share2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { showErrorToast, showSuccessToast } from '@/lib/toast'

interface ExportMenuProps {
  onExportMarkdown: () => string
  onExportJSON: () => string
  isDisabled?: boolean
}

export function ExportMenu({ onExportMarkdown, onExportJSON, isDisabled }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = async (type: 'markdown' | 'json') => {
    try {
      const content = type === 'markdown' ? onExportMarkdown() : onExportJSON()
      await navigator.clipboard.writeText(content)
      setCopied(type)
      showSuccessToast('Copied', `${type.toUpperCase()} copied to clipboard`)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      showErrorToast('Copy Failed', 'Clipboard access was unavailable.')
    }
  }

  const handleDownload = (type: 'markdown' | 'json') => {
    const content = type === 'markdown' ? onExportMarkdown() : onExportJSON()
    const fileName = `research_report_${new Date().toISOString().split('T')[0]}.${type === 'markdown' ? 'md' : 'json'}`
    const blob = new Blob([content], { type: type === 'markdown' ? 'text/markdown' : 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showSuccessToast('Downloaded', `${type} file downloaded`)
  }

  const items = [
    {
      key: 'markdown-download',
      icon: <FileText className="h-5 w-5 text-primary" />,
      title: 'Full Report',
      description: 'Markdown export with formatting',
      action: () => handleDownload('markdown'),
      trailing: <Download className="h-4 w-4 text-muted-foreground" />,
    },
    {
      key: 'json-download',
      icon: <FileText className="h-5 w-5 text-cyan-400" />,
      title: 'Data Summary',
      description: 'Structured JSON export',
      action: () => handleDownload('json'),
      trailing: <Download className="h-4 w-4 text-muted-foreground" />,
    },
    {
      key: 'markdown-copy',
      icon: copied === 'markdown' ? <Check className="h-5 w-5 text-primary" /> : <Copy className="h-5 w-5 text-cyan-400" />,
      title: 'Copy Markdown',
      description: 'Copy report to clipboard',
      action: () => handleCopy('markdown'),
    },
  ]

  return (
    <div className="relative">
      <Button
        onClick={() => setOpen(!open)}
        disabled={isDisabled}
        variant="secondary"
        className="h-12 rounded-2xl px-5"
      >
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-3 w-72 rounded-[24px] premium-panel p-2 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300">
          <div className="relative space-y-1">
            {items.map((item, index) => (
              <button
                key={item.key}
                onClick={item.action}
                className="flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition-all hover:bg-white/[0.05] rise-in group [html.light_&]:hover:bg-primary/[0.06]"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition-transform duration-300 group-hover:scale-105 ambient-pulse [html.light_&]:border-border/50 [html.light_&]:bg-white/75">
                  {item.icon}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-bold text-foreground">{item.title}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{item.description}</span>
                </span>
                {item.trailing}
              </button>
            ))}

            <div className="mx-2 h-px bg-white/8 [html.light_&]:bg-border/70" />

            <div className="flex items-start gap-3 rounded-2xl px-4 py-3 opacity-60 rise-in" style={{ animationDelay: '220ms' }}>
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] [html.light_&]:border-border/50 [html.light_&]:bg-white/75">
                <Share2 className="h-5 w-5 text-cyan-300 [html.light_&]:text-cyan-600" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-foreground">Share Link</span>
                <span className="mt-1 block text-xs text-muted-foreground">Coming soon</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  )
}
