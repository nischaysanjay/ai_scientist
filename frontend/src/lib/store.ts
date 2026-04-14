import { create } from 'zustand'
import { Paper, ExtractedPaper, ValidationResult } from '@/types'

export type WorkflowStep = 
  | 'idle' 
  | 'searching' 
  | 'processing' 
  | 'summarizing' 
  | 'analyzing-gaps' 
  | 'generating-hypotheses' 
  | 'planning-experiment' 
  | 'validating' 
  | 'complete'

export interface WorkflowState {
  // Workflow state
  currentStep: WorkflowStep
  isLoading: boolean
  error: string | null

  // User input
  topic: string
  numPapers: number
  modelName: string
  useCustomHypothesis: boolean
  customHypothesis: string | null

  // Data
  papers: Paper[]
  extractedData: ExtractedPaper[]
  summary: string | null
  gaps: string | null
  hypotheses: string | null
  experimentPlan: string | null
  validationResult: ValidationResult | null

  // Actions
  setTopic: (topic: string) => void
  setNumPapers: (num: number) => void
  setModelName: (name: string) => void
  setUseCustomHypothesis: (use: boolean) => void
  setCustomHypothesis: (hypothesis: string | null) => void
  setCurrentStep: (step: WorkflowStep) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPapers: (papers: Paper[]) => void
  setExtractedData: (data: ExtractedPaper[]) => void
  setSummary: (summary: string | null) => void
  setGaps: (gaps: string | null) => void
  setHypotheses: (hypotheses: string | null) => void
  setExperimentPlan: (plan: string | null) => void
  setValidationResult: (result: ValidationResult | null) => void
  clearWorkflowData: () => void
  resetWorkflow: () => void
}

const initialState = {
  currentStep: 'idle' as WorkflowStep,
  isLoading: false,
  error: null,
  topic: '',
  numPapers: 5,
  modelName: 'mistral',
  useCustomHypothesis: false,
  customHypothesis: null,
  papers: [],
  extractedData: [],
  summary: null,
  gaps: null,
  hypotheses: null,
  experimentPlan: null,
  validationResult: null,
}

export const useWorkflowStore = create<WorkflowState>()(
  (set) => ({
    ...initialState,

    setTopic: (topic) => set({ topic }),
    setNumPapers: (num) => set({ numPapers: num }),
    setModelName: (name) => set({ modelName: name }),
    setUseCustomHypothesis: (use) => set({ useCustomHypothesis: use }),
    setCustomHypothesis: (hypothesis) => set({ customHypothesis: hypothesis }),
    setCurrentStep: (step) => set({ currentStep: step }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    setPapers: (papers) => set({ papers }),
    setExtractedData: (data) => set({ extractedData: data }),
    setSummary: (summary) => set({ summary }),
    setGaps: (gaps) => set({ gaps }),
    setHypotheses: (hypotheses) => set({ hypotheses }),
    setExperimentPlan: (plan) => set({ experimentPlan: plan }),
    setValidationResult: (result) => set({ validationResult: result }),
    clearWorkflowData: () =>
      set((state) => ({
        ...state,
        currentStep: 'idle',
        isLoading: false,
        error: null,
        papers: [],
        extractedData: [],
        summary: null,
        gaps: null,
        hypotheses: null,
        experimentPlan: null,
        validationResult: null,
      })),

    resetWorkflow: () => set(() => ({
      ...initialState,
    })),
  })
)
