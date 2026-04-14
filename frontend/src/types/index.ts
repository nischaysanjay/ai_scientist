// Paper model matching arXiv response
export interface Paper {
  title: string
  authors: string[]
  pdf_url: string
  summary: string
  published?: string
}

// Extracted data from PDFs
export interface ExtractedPaper {
  text: string
  source: string
  title: string
}

// API Response types
export interface ApiSuccessResponse<T> {
  status: 'success'
  data?: T
  [key: string]: unknown
}

export interface ApiErrorResponse {
  status: 'error'
  error: string
}

// Validation metrics
export interface ValidationMetrics {
  stability_score: number
  novelty_score: number
  viability_score: number
}

// CDM (Contradiction Density Metric) Result
export interface CDMDetail {
  source: string
  claim: string
  classification: 'CONTRADICT' | 'SUPPORT' | 'NEUTRAL'
  raw_response: string
}

export interface CDMResult {
  cdm_score: number
  strength_score: number
  stability: string
  total_chunks_evaluated: number
  contradictions: number
  supporting_chunks: number
  neutral_chunks: number
  conflict_summary: string
  details: CDMDetail[]
}

// NDI (Novelty Distance Index) Result
export interface NDIResult {
  ndi_score: number
  max_similarity: number
  novelty: string
}

// Validation result
export interface ValidationResult {
  hypothesis: string
  classification: 'Strong & Novel' | 'Novel but Weak' | 'Stable but Known' | 'Weak & Redundant'
  metrics: ValidationMetrics
  cdm: CDMResult
  ndi: NDIResult
}

// Request types (for documentation/reference)
export interface SearchPapersRequest {
  topic: string
  max_results: number
}

export interface ProcessPDFsRequest {
  papers: Paper[]
  download_dir?: string
}

export interface GenerateSummaryRequest {
  extracted_data: ExtractedPaper[]
  topic: string
  model_name?: string
}

export interface IdentifyGapsRequest {
  summary: string
  topic: string
  model_name?: string
}

export interface GenerateHypothesesRequest {
  gaps: string
  topic: string
  model_name?: string
}

export interface PlanExperimentRequest {
  hypotheses: string
  model_name?: string
}

export interface ValidateHypothesisRequest {
  hypothesis: string
  extracted_data: ExtractedPaper[]
  model_name?: string
}

// Legacy for compatibility
export type AIResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse
