'use client'

import { useEffect, useState, useRef } from 'react'
import { Moon, Sun, Zap, ChevronDown, Check } from 'lucide-react'
import { useTheme } from '@/lib/theme-provider'
import { Button } from '@/components/ui/button'

const themeOrder = ['light', 'dark', 'auto'] as const
type Theme = typeof themeOrder[number]

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const themeLabel = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System'

  const handleSelect = (t: Theme) => {
    setTheme(t)
    setIsOpen(false)
  }

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-11 rounded-2xl px-4 group gap-2.5 min-w-[115px] justify-between"
        disabled
      >
        <div className="flex items-center gap-2.5">
          <Zap className="h-4 w-4 ambient-pulse text-muted-foreground/40" />
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">System</span>
        </div>
        <ChevronDown className="h-3 w-3 opacity-30" />
      </Button>
    )
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-11 rounded-2xl px-4 group gap-2.5 min-w-[115px] justify-between"
        title="Change theme"
      >
        <div className="flex items-center gap-2.5">
          {theme === 'dark' && <Moon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />}
          {theme === 'light' && <Sun className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />}
          {theme === 'auto' && <Zap className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />}
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground group-hover:text-foreground transition-colors duration-300">
            {themeLabel}
          </span>
        </div>
        <ChevronDown className={`h-3 w-3 opacity-50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-40 origin-top-right rounded-[20px] bg-background/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.15)] ring-1 ring-black/5 focus:outline-none z-[100] p-1.5 animate-in fade-in zoom-in-95 slide-in-from-top-3 duration-200">
          <div className="flex flex-col gap-1">
            <button onClick={() => handleSelect('light')} className={`group flex items-center justify-between w-full px-3 py-2.5 text-xs font-bold tracking-wide rounded-[14px] transition-all duration-300 ${theme === 'light' ? 'bg-primary/15 text-primary shadow-sm' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'}`}>
              <div className="flex items-center gap-2.5">
                <Sun className={`h-4 w-4 transition-transform duration-300 ${theme === 'light' ? 'rotate-12 scale-110' : 'group-hover:rotate-12'}`} /> 
                <span>Light</span>
              </div>
              {theme === 'light' && <Check className="h-3.5 w-3.5" />}
            </button>
            
            <button onClick={() => handleSelect('dark')} className={`group flex items-center justify-between w-full px-3 py-2.5 text-xs font-bold tracking-wide rounded-[14px] transition-all duration-300 ${theme === 'dark' ? 'bg-primary/15 text-primary shadow-sm' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'}`}>
              <div className="flex items-center gap-2.5">
                <Moon className={`h-4 w-4 transition-transform duration-300 ${theme === 'dark' ? '-rotate-12 scale-110' : 'group-hover:-rotate-12'}`} /> 
                <span>Dark</span>
              </div>
              {theme === 'dark' && <Check className="h-3.5 w-3.5" />}
            </button>
            
            <button onClick={() => handleSelect('auto')} className={`group flex items-center justify-between w-full px-3 py-2.5 text-xs font-bold tracking-wide rounded-[14px] transition-all duration-300 ${theme === 'auto' ? 'bg-primary/15 text-primary shadow-sm' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'}`}>
              <div className="flex items-center gap-2.5">
                <Zap className={`h-4 w-4 transition-transform duration-300 ${theme === 'auto' ? 'scale-110' : 'group-hover:scale-110'}`} /> 
                <span>System</span>
              </div>
              {theme === 'auto' && <Check className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
