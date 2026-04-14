import axios, { AxiosInstance } from 'axios'
import {
  Paper,
  ExtractedPaper,
  ValidationResult,
} from '@/types'

class ApiClient {
  private client: AxiosInstance

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async searchPapers(topic: string, maxResults: number = 5, signal?: AbortSignal): Promise<Paper[]> {
    const response = await this.client.post('/api/search-papers', {
      topic,
      max_results: maxResults,
    }, { signal })
    return response.data
  }

  async processPDFs(papers: Paper[], downloadDir: string = 'papers', signal?: AbortSignal): Promise<ExtractedPaper[]> {
    const response = await this.client.post('/api/process-pdfs', {
      papers,
      download_dir: downloadDir,
    }, { signal })
    return response.data.extracted_data
  }

  async generateSummary(extractedData: ExtractedPaper[], topic: string, modelName: string = 'mistral', signal?: AbortSignal): Promise<string> {
    const response = await this.client.post('/api/generate-summary', {
      extracted_data: extractedData,
      topic,
      model_name: modelName,
    }, { signal })
    return response.data.summary
  }

  async identifyGaps(summary: string, topic: string, modelName: string = 'mistral', signal?: AbortSignal): Promise<string> {
    const response = await this.client.post('/api/identify-gaps', {
      summary,
      topic,
      model_name: modelName,
    }, { signal })
    return response.data.gaps
  }

  async generateHypotheses(gaps: string, topic: string, modelName: string = 'mistral', signal?: AbortSignal): Promise<string> {
    const response = await this.client.post('/api/generate-hypotheses', {
      gaps,
      topic,
      model_name: modelName,
    }, { signal })
    return response.data.hypotheses
  }

  async planExperiment(hypotheses: string, modelName: string = 'mistral', signal?: AbortSignal): Promise<string> {
    const response = await this.client.post('/api/plan-experiment', {
      hypotheses,
      model_name: modelName,
    }, { signal })
    return response.data.plan
  }

  async validateHypothesis(hypothesis: string, extractedData: ExtractedPaper[], modelName: string = 'mistral', signal?: AbortSignal): Promise<ValidationResult> {
    const response = await this.client.post('/api/validate-hypothesis', {
      hypothesis,
      extracted_data: extractedData,
      model_name: modelName,
    }, { signal })
    return response.data.validation_result
  }
}

export const apiClient = new ApiClient()
