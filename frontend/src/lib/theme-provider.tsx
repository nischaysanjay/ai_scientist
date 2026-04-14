'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  effectiveTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'auto'
  }

  const saved = localStorage.getItem('theme-preference')
  return saved === 'light' || saved === 'dark' || saved === 'auto' ? saved : 'auto'
}

function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  if (theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  return theme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() =>
    getEffectiveTheme(getStoredTheme())
  )

  useEffect(() => {
    const html = document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    let transitionTimeout: number | undefined

    const applyTheme = (nextTheme: Theme) => {
      const actual: 'light' | 'dark' = nextTheme === 'auto' ? (mediaQuery.matches ? 'dark' : 'light') : nextTheme

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
  }, [theme])

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
