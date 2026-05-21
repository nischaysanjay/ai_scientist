'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/cn'

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-background/60 backdrop-blur-md text-primary shadow-[0_4px_20px_rgba(139,92,246,0.2)] dark:bg-zinc-950/60 transition-all duration-500 hover:scale-110 hover:border-primary/50 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_24px_rgba(139,92,246,0.45)] cursor-pointer active:scale-95",
        isVisible 
          ? "opacity-100 translate-y-0 pointer-events-auto scale-100" 
          : "opacity-0 translate-y-4 pointer-events-none scale-75"
      )}
      title="Back to Top"
    >
      <ArrowUp className="h-5 w-5 animate-pulse-soft" />
    </button>
  )
}
