import { useState, useEffect } from 'react'

/**
 * Validates that required environment variables are set
 * Throws error if any are missing
 */
export function validateEnvironment(): void {
  const requiredVars = ['NEXT_PUBLIC_API_URL']

  const missing = requiredVars.filter((variable) => {
    const value = process.env[variable]
    return !value || value.trim() === ''
  })

  if (missing.length > 0) {
    console.warn(
      `Missing environment variables: ${missing.join(', ')}. Using default values.`
    )
  }
}

/**
 * Hook to check if API is reachable
 */
export function useApiHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/health`)

        if (response.ok) {
          setIsHealthy(true)
          setError(null)
        } else {
          setIsHealthy(false)
          setError('API returned unhealthy status')
        }
      } catch (err) {
        setIsHealthy(false)
        const message = err instanceof Error ? err.message : 'Failed to reach API'
        setError(message)
        console.error('API health check failed:', message)
      }
    }

    checkHealth()
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000)

    return () => clearInterval(interval)
  }, [])

  return { isHealthy, error }
}
