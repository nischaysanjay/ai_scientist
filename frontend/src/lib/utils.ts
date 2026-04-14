/**
 * Loading state management utilities
 */

export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export const createLoadingState = (
  isLoading: boolean = false,
  error: string | null = null
): LoadingState => ({
  isLoading,
  error,
})

/**
 * Error handling utilities
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof Error) {
    return new ApiError(error.message, undefined, error)
  }

  const message = String(error) || 'An unknown error occurred'
  return new ApiError(message)
}

/**
 * Retry logic for failed requests
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)))
      }
    }
  }

  throw lastError || new Error('Max retries exceeded')
}
