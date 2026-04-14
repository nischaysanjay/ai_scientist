'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  effectiveTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('auto')
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load from localStorage
    const saved = localStorage.getItem('theme-preference') as Theme | null
    if (saved) {
      setThemeState(saved)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const html = document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    let transitionTimeout: number | undefined

    const applyTheme = (nextTheme: Theme) => {
      const actual: 'light' | 'dark' =
        nextTheme === 'auto' ? (mediaQuery.matches ? 'dark' : 'light') : nextTheme

      html.classList.add('theme-transitioning')
      if (transitionTimeout) {
        window.clearTimeout(transitionTimeout)
      }

      setEffectiveTheme(actual)
      html.classList.toggle('dark', actual === 'dark')
      html.classList.toggle('light', actual === 'light')

      transitionTimeout = window.setTimeout(() => {
        html.classList.remove('theme-transitioning')
      }, 280)
    }

    applyTheme(theme)

    const handleSystemThemeChange = () => {
      if (theme === 'auto') {
        applyTheme('auto')
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
      if (transitionTimeout) {
        window.clearTimeout(transitionTimeout)
      }
      html.classList.remove('theme-transitioning')
    }
  }, [theme, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme-preference', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
