'use client'

import { Moon, Sun, Zap } from 'lucide-react'
import { useTheme } from '@/lib/theme-provider'
import { Button } from '@/components/ui/button'

const themeOrder = ['light', 'dark', 'auto'] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const themeLabel = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'Auto'

  const handleToggle = () => {
    const currentIndex = themeOrder.indexOf(theme)
    const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length]
    setTheme(nextTheme)
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={handleToggle}
      className="h-11 rounded-2xl px-4 group gap-2.5"
      title={`Current theme: ${theme}. Click to switch.`}
      aria-label={`Current theme: ${theme}. Click to switch theme.`}
    >
      {theme === 'dark' && <Moon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />}
      {theme === 'light' && <Sun className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />}
      {theme === 'auto' && <Zap className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 ambient-pulse" />}
      <span className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground group-hover:text-foreground transition-colors duration-300">
        {themeLabel}
      </span>
    </Button>
  )
}
