import { create } from 'zustand'
import { Paper, ExtractedPaper, ValidationResult, ResearchSession } from '@/types'

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

  // Active session tracking
  activeSessionId: string | null
  sessions: ResearchSession[]

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
  
  // Session actions
  setActiveSessionId: (id: string | null) => void
  loadAllSessionsFromStorage: () => void
  saveCurrentSession: () => void
  loadSession: (id: string) => void
  deleteSession: (id: string) => void
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
  activeSessionId: null as string | null,
  sessions: [] as ResearchSession[],
}

export const useWorkflowStore = create<WorkflowState>()(
  (set, get) => ({
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
    setActiveSessionId: (id) => set({ activeSessionId: id }),
    
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
        activeSessionId: null,
      })),

    resetWorkflow: () => set(() => ({
      ...initialState,
    })),

    loadAllSessionsFromStorage: () => {
      if (typeof window !== 'undefined') {
        try {
          const raw = window.localStorage.getItem('ai_scientist_history_v1')
          if (raw) {
            const parsed = JSON.parse(raw) as ResearchSession[]
            if (Array.isArray(parsed)) {
              set({ sessions: parsed })
            }
          }
        } catch (e) {
          console.error('Failed to load sessions from localStorage:', e)
        }
      }
    },

    saveCurrentSession: () => {
      const state = get()
      if (!state.topic || state.currentStep !== 'complete') return

      const newSession: ResearchSession = {
        id: state.activeSessionId || `session_${Date.now()}`,
        timestamp: Date.now(),
        topic: state.topic,
        papers: state.papers,
        extractedData: state.extractedData,
        summary: state.summary,
        gaps: state.gaps,
        hypotheses: state.hypotheses,
        experimentPlan: state.experimentPlan,
        validationResult: state.validationResult,
        numPapers: state.numPapers,
        modelName: state.modelName,
        useCustomHypothesis: state.useCustomHypothesis,
        customHypothesis: state.customHypothesis,
      }

      let updatedSessions = [...state.sessions]
      const existingIdx = updatedSessions.findIndex((s) => s.id === newSession.id)

      if (existingIdx > -1) {
        updatedSessions[existingIdx] = newSession
      } else {
        // Dedupe sessions by exact topic to avoid multiple runs of the same topic
        updatedSessions = updatedSessions.filter(
          (s) => s.topic.trim().toLowerCase() !== state.topic.trim().toLowerCase()
        )
        updatedSessions.unshift(newSession)
      }

      // Cap at 10 sessions to stay safe on browser quota limits
      if (updatedSessions.length > 10) {
        updatedSessions = updatedSessions.slice(0, 10)
      }

      set({ sessions: updatedSessions, activeSessionId: newSession.id })

      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('ai_scientist_history_v1', JSON.stringify(updatedSessions))
        } catch (e) {
          console.error('Failed to save session history to localStorage:', e)
        }
      }
    },

    loadSession: (id) => {
      const session = get().sessions.find((s) => s.id === id)
      if (!session) return

      set({
        activeSessionId: session.id,
        currentStep: 'complete',
        isLoading: false,
        error: null,
        topic: session.topic,
        numPapers: session.numPapers,
        modelName: session.modelName,
        useCustomHypothesis: session.useCustomHypothesis,
        customHypothesis: session.customHypothesis,
        papers: session.papers || [],
        extractedData: session.extractedData || [],
        summary: session.summary,
        gaps: session.gaps,
        hypotheses: session.hypotheses,
        experimentPlan: session.experimentPlan,
        validationResult: session.validationResult,
      })
    },

    deleteSession: (id) => {
      const updatedSessions = get().sessions.filter((s) => s.id !== id)
      set({ sessions: updatedSessions })

      if (get().activeSessionId === id) {
        set({ activeSessionId: null })
        get().resetWorkflow()
      }

      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('ai_scientist_history_v1', JSON.stringify(updatedSessions))
        } catch (e) {
          console.error('Failed to delete session from localStorage:', e)
        }
      }
    },
  })
)
