import { useCallback } from 'react'
import { apiClient } from '@/services/api'
import { useWorkflowStore } from '@/lib/store'
import { Paper, ExtractedPaper } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Generic helper that opens a POST-based SSE stream, appends tokens to state
 * via `onToken`, and resolves to the full accumulated text when done.
 */
async function fetchSSEStream(
  endpoint: string,
  body: Record<string, unknown>,
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    throw new Error(`Stream request failed: ${response.status} ${response.statusText}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let accumulated = ''
  let isDone = false

  while (!isDone) {
    const { done, value } = await reader.read()
    if (done) break

    const text = decoder.decode(value, { stream: true })
    const lines = text.split('\n')

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6).trim()
      if (payload === '[DONE]') {
        isDone = true
        break
      }
      try {
        const parsed = JSON.parse(payload)
        if (parsed.error) throw new Error(parsed.error)
        if (parsed.token) {
          accumulated += parsed.token
          onToken(parsed.token)
        }
      } catch {
        // skip malformed lines
      }
    }
  }

  reader.cancel()
  return accumulated
}


const isAbortError = (err: unknown): boolean => {
  if (err && typeof err === 'object') {
    const error = err as { name?: string; message?: string; code?: string }
    return (
      error.name === 'AbortError' ||
      error.name === 'CanceledError' ||
      error.message === 'canceled' ||
      error.code === 'ERR_CANCELED'
    )
  }
  return false
}

/**
 * Hook for searching papers and updating workflow state
 */
export const useSearchPapers = () => {
  const { setError, setIsLoading, setPapers, setCurrentStep } = useWorkflowStore()

  const searchPapers = useCallback(
    async (topic: string, maxResults: number, signal?: AbortSignal) => {
      try {
        setIsLoading(true)
        setError(null)
        setCurrentStep('searching')

        const results = await apiClient.searchPapers(topic, maxResults, signal)
        setPapers(results)
        setCurrentStep('idle')

        return results
      } catch (err) {
        if (isAbortError(err)) {
          setError(null)
          setCurrentStep('idle')
          throw err
        }
        const message = err instanceof Error ? err.message : 'Failed to search papers'
        setError(message)
        setCurrentStep('idle')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [setError, setIsLoading, setPapers, setCurrentStep]
  )

  return { searchPapers }
}

/**
 * Hook for processing PDFs and updating workflow state
 */
export const useProcessPDFs = () => {
  const { setError, setIsLoading, setExtractedData, setCurrentStep } = useWorkflowStore()

  const processPDFs = useCallback(
    async (papers: Paper[], signal?: AbortSignal) => {
      try {
        setIsLoading(true)
        setError(null)
        setCurrentStep('processing')

        const data = await apiClient.processPDFs(papers, undefined, signal)
        setExtractedData(data)
        setCurrentStep('idle')

        return data
      } catch (err) {
        if (isAbortError(err)) {
          setError(null)
          setCurrentStep('idle')
          throw err
        }
        const message = err instanceof Error ? err.message : 'Failed to process PDFs'
        setError(message)
        setCurrentStep('idle')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [setError, setIsLoading, setExtractedData, setCurrentStep]
  )

  return { processPDFs }
}

/**
 * Hook for generating research summary
 */
export const useGenerateSummary = () => {
  const { setError, setIsLoading, setSummary, setCurrentStep } = useWorkflowStore()

  const generateSummary = useCallback(
    async (extractedData: ExtractedPaper[], topic: string, modelName: string = 'mistral', signal?: AbortSignal) => {
      try {

        setIsLoading(true)
        setError(null)
        setCurrentStep('summarizing')

        const summary = await apiClient.generateSummary(extractedData, topic, modelName, signal)
        setSummary(summary)
        setCurrentStep('idle')

        return summary
      } catch (err) {
        if (isAbortError(err)) {
          setError(null)
          setCurrentStep('idle')
          throw err
        }
        const message = err instanceof Error ? err.message : 'Failed to generate summary'
        setError(message)
        setCurrentStep('idle')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [setError, setIsLoading, setSummary, setCurrentStep]
  )

  return { generateSummary }
}

/**
 * Hook for identifying research gaps
 */
export const useIdentifyGaps = () => {
  const { setError, setIsLoading, setGaps, setCurrentStep } = useWorkflowStore()

  const identifyGaps = useCallback(
    async (summary: string, topic: string, modelName: string = 'mistral', signal?: AbortSignal) => {
      try {
        setIsLoading(true)
        setError(null)
        setCurrentStep('analyzing-gaps')

        const result = await apiClient.identifyGaps(summary, topic, modelName, signal)
        setGaps(result)
        setCurrentStep('idle')

        return result
      } catch (err) {
        if (isAbortError(err)) {
          setError(null)
          setCurrentStep('idle')
          throw err
        }
        const message = err instanceof Error ? err.message : 'Failed to identify gaps'
        setError(message)
        setCurrentStep('idle')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [setError, setIsLoading, setGaps, setCurrentStep]
  )

  return { identifyGaps }
}

/**
 * Hook for generating hypotheses
 */
export const useGenerateHypotheses = () => {
  const { setError, setIsLoading, setHypotheses, setCurrentStep } = useWorkflowStore()

  const generateHypotheses = useCallback(
    async (gaps: string, topic: string, modelName: string = 'mistral', signal?: AbortSignal) => {
      try {
        setIsLoading(true)
        setError(null)
        setCurrentStep('generating-hypotheses')

        const result = await apiClient.generateHypotheses(gaps, topic, modelName, signal)
        setHypotheses(result)
        setCurrentStep('idle')

        return result
      } catch (err) {
        if (isAbortError(err)) {
          setError(null)
          setCurrentStep('idle')
          throw err
        }
        const message = err instanceof Error ? err.message : 'Failed to generate hypotheses'
        setError(message)
        setCurrentStep('idle')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [setError, setIsLoading, setHypotheses, setCurrentStep]
  )

  return { generateHypotheses }
}

/**
 * Hook for planning experiments
 */
export const usePlanExperiment = () => {
  const { setError, setIsLoading, setExperimentPlan, setCurrentStep } = useWorkflowStore()

  const planExperiment = useCallback(
    async (hypotheses: string, modelName: string = 'mistral', signal?: AbortSignal) => {
      try {
        setIsLoading(true)
        setError(null)
        setCurrentStep('planning-experiment')

        const result = await apiClient.planExperiment(hypotheses, modelName, signal)
        setExperimentPlan(result)
        setCurrentStep('idle')

        return result
      } catch (err) {
        if (isAbortError(err)) {
          setError(null)
          setCurrentStep('idle')
          throw err
        }
        const message = err instanceof Error ? err.message : 'Failed to plan experiment'
        setError(message)
        setCurrentStep('idle')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [setError, setIsLoading, setExperimentPlan, setCurrentStep]
  )

  return { planExperiment }
}

/**
 * Hook for validating hypothesis
 */
export const useValidateHypothesis = () => {
  const { setError, setIsLoading, setValidationResult, setCurrentStep } = useWorkflowStore()

  const validateHypothesis = useCallback(
    async (hypothesis: string, extractedData: ExtractedPaper[], topic: string, modelName: string = 'mistral', signal?: AbortSignal) => {
      try {
        setIsLoading(true)
        setError(null)
        setCurrentStep('validating')


        const result = await apiClient.validateHypothesis(hypothesis, extractedData, topic, modelName, signal)
        

        setValidationResult(result)
        setCurrentStep('complete')

        return result
      } catch (err) {
        if (isAbortError(err)) {
          setError(null)
          setCurrentStep('idle')
          throw err
        }
        const message = err instanceof Error ? err.message : 'Failed to validate hypothesis'
        setError(message)
        setCurrentStep('idle')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [setError, setIsLoading, setValidationResult, setCurrentStep]
  )

  return { validateHypothesis }
}

// ============================================================
// Streaming Hooks — real-time token-by-token updates
// ============================================================

/**
 * Streams a research summary, appending tokens to the store as they arrive.
 */
export const useStreamSummary = () => {
  const { setError, setIsLoading, setSummary, setCurrentStep } = useWorkflowStore()

  const streamSummary = useCallback(
    async (
      extractedData: ExtractedPaper[],
      topic: string,
      modelName: string = 'mistral',
      signal?: AbortSignal
    ) => {
      try {
        setIsLoading(true)
        setError(null)
        setCurrentStep('summarizing')
        setSummary('') // clear first so UI resets

        const result = await fetchSSEStream(
          '/api/stream-summary',
          { extracted_data: extractedData, topic, model_name: modelName },
          (token) => setSummary(useWorkflowStore.getState().summary + token),
          signal
        )

        setCurrentStep('idle')
        return result
      } catch (err) {
        if (isAbortError(err)) { setError(null); setCurrentStep('idle'); throw err }
        const message = err instanceof Error ? err.message : 'Failed to stream summary'
        setError(message)
        setCurrentStep('idle')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [setError, setIsLoading, setSummary, setCurrentStep]
  )

  return { streamSummary }
}

/**
 * Streams research gaps, appending tokens to the store as they arrive.
 */
export const useStreamGaps = () => {
  const { setError, setIsLoading, setGaps, setCurrentStep } = useWorkflowStore()

  const streamGaps = useCallback(
    async (
      summary: string,
      topic: string,
      modelName: string = 'mistral',
      signal?: AbortSignal
    ) => {
      try {
        setIsLoading(true)
        setError(null)
        setCurrentStep('analyzing-gaps')
        setGaps('')

        const result = await fetchSSEStream(
          '/api/stream-gaps',
          { summary, topic, model_name: modelName },
          (token) => setGaps(useWorkflowStore.getState().gaps + token),
          signal
        )

        setCurrentStep('idle')
        return result
      } catch (err) {
        if (isAbortError(err)) { setError(null); setCurrentStep('idle'); throw err }
        const message = err instanceof Error ? err.message : 'Failed to stream gaps'
        setError(message)
        setCurrentStep('idle')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [setError, setIsLoading, setGaps, setCurrentStep]
  )

  return { streamGaps }
}

/**
 * Streams hypotheses, appending tokens to the store as they arrive.
 */
export const useStreamHypotheses = () => {
  const { setError, setIsLoading, setHypotheses, setCurrentStep } = useWorkflowStore()

  const streamHypotheses = useCallback(
    async (
      gaps: string,
      topic: string,
      modelName: string = 'mistral',
      signal?: AbortSignal
    ) => {
      try {
        setIsLoading(true)
        setError(null)
        setCurrentStep('generating-hypotheses')
        setHypotheses('')

        const result = await fetchSSEStream(
          '/api/stream-hypotheses',
          { gaps, topic, model_name: modelName },
          (token) => setHypotheses(useWorkflowStore.getState().hypotheses + token),
          signal
        )

        setCurrentStep('idle')
        return result
      } catch (err) {
        if (isAbortError(err)) { setError(null); setCurrentStep('idle'); throw err }
        const message = err instanceof Error ? err.message : 'Failed to stream hypotheses'
        setError(message)
        setCurrentStep('idle')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [setError, setIsLoading, setHypotheses, setCurrentStep]
  )

  return { streamHypotheses }
}

/**
 * Streams an experiment plan, appending tokens to the store as they arrive.
 */
export const useStreamExperiment = () => {
  const { setError, setIsLoading, setExperimentPlan, setCurrentStep } = useWorkflowStore()

  const streamExperiment = useCallback(
    async (
      hypotheses: string,
      modelName: string = 'mistral',
      signal?: AbortSignal
    ) => {
      try {
        setIsLoading(true)
        setError(null)
        setCurrentStep('planning-experiment')
        setExperimentPlan('')

        const result = await fetchSSEStream(
          '/api/stream-experiment',
          { hypotheses, model_name: modelName },
          (token) => setExperimentPlan(useWorkflowStore.getState().experimentPlan + token),
          signal
        )

        setCurrentStep('idle')
        return result
      } catch (err) {
        if (isAbortError(err)) { setError(null); setCurrentStep('idle'); throw err }
        const message = err instanceof Error ? err.message : 'Failed to stream experiment plan'
        setError(message)
        setCurrentStep('idle')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [setError, setIsLoading, setExperimentPlan, setCurrentStep]
  )

  return { streamExperiment }
}
