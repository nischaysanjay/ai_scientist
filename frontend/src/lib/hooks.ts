import { useCallback } from 'react'
import { apiClient } from '@/services/api'
import { useWorkflowStore } from '@/lib/store'
import { Paper, ExtractedPaper } from '@/types'

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
