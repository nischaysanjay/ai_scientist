'use client'

import { useEffect, useRef, useState } from 'react'
import { useWorkflowStore } from '@/lib/store'
import { useKeyboardShortcuts } from '@/lib/keyboard-shortcuts'
import {
  useSearchPapers,
  useProcessPDFs,
  useValidateHypothesis,
} from '@/lib/hooks'
import {
  useStreamSummary,
  useStreamGaps,
  useStreamHypotheses,
  useStreamExperiment,
} from '@/lib/hooks'
import { useApiHealth } from '@/lib/env'
import { showSuccessToast, showErrorToast } from '@/lib/toast'
import { Sidebar } from '@/components/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { LoadingSpinner, ResultSkeleton } from '@/components/loading-skeleton'
import { ErrorMessage } from '@/components/error-message'
import { ResultSection, ResultContent } from '@/components/result-section'
import { 
  ValidationBadge, 
  MetricCard,
  CDMResultDisplay,
  NDIResultDisplay,
  MetricsRadarDisplay,
} from '@/components/validation-display'
import { WorkflowProgress } from '@/components/workflow-progress'
import { cn } from '@/lib/cn'
import { EmptyState } from '@/components/empty-state'
import { ExportMenu } from '@/components/export-menu'
import { EnhancedPaperList } from '@/components/enhanced-paper-card'
import { ThemeToggle } from '@/components/theme-toggle'
import { KeyboardShortcutsModal } from '@/components/keyboard-shortcuts-modal'
import { TabStatusBadge, TabStatus } from '@/components/tab-status'
import { 
  AlertCircle, 
  BookOpen, 
  Lightbulb, 
  TestTube, 
  Target, 
  Sparkles,
  ShieldCheck,
  Fingerprint,
  Zap,
  RotateCcw,
  X
} from 'lucide-react'
import { generateMarkdownReport, downloadFile } from '@/lib/export-utils'

type ResultTab = 'validation' | 'papers' | 'summary' | 'gaps' | 'hypotheses' | 'experiment'

export default function Home() {
  const [isRunning, setIsRunning] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [activeTab, setActiveTab] = useState<ResultTab>('validation')
  const stopRequestedRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const { isHealthy, error: healthError } = useApiHealth()

  const {
    topic,
    setTopic,
    numPapers,
    modelName,
    useCustomHypothesis,
    customHypothesis,
    papers,
    extractedData,
    summary,
    gaps,
    hypotheses,
    experimentPlan,
    validationResult,
    isLoading,
    error,
    currentStep,
    resetWorkflow,
  } = useWorkflowStore()

  const { searchPapers } = useSearchPapers()
  const { processPDFs } = useProcessPDFs()
  const { validateHypothesis: validateHyp } = useValidateHypothesis()
  const { streamSummary } = useStreamSummary()
  const { streamGaps } = useStreamGaps()
  const { streamHypotheses } = useStreamHypotheses()
  const { streamExperiment } = useStreamExperiment()

  // Get step label for UI
  const getStepLabel = (step: string) => {
    const labels: Record<string, string> = {
      idle: 'Ready',
      searching: 'Searching Papers...',
      processing: 'Processing PDFs...',
      summarizing: 'Generating Summary...',
      'analyzing-gaps': 'Analyzing Gaps...',
      'generating-hypotheses': 'Generating Hypotheses...',
      'planning-experiment': 'Planning Experiments...',
      validating: 'Validating Hypothesis...',
      complete: 'Complete!',
    }
    return labels[step] || step
  }

  // Handle Export
  const handleExport = () => {
    if (!validationResult && !summary) {
      showErrorToast('Error', 'No data to export yet')
      return
    }

    const report = generateMarkdownReport(
      topic,
      summary,
      gaps,
      hypotheses,
      experimentPlan,
      validationResult,
      papers
    )

    downloadFile(
      report,
      `research_report_${topic.replace(/\s+/g, '_').toLowerCase()}.md`,
      'text/markdown'
    )
    showSuccessToast('Exported', 'Research report downloaded successfully')
  }

  const handleStopWorkflow = () => {
    if (!isRunning || isStopping) return

    stopRequestedRef.current = true
    abortControllerRef.current?.abort()
    setIsStopping(true)
    setIsRunning(false)
    showErrorToast('Stopped', 'Workflow stopped. Partial results were kept.')
  }

  useEffect(() => {
    const tabByStep: Partial<Record<typeof currentStep, ResultTab>> = {
      searching: 'papers',
      processing: 'papers',
      summarizing: 'summary',
      'analyzing-gaps': 'gaps',
      'generating-hypotheses': 'hypotheses',
      'planning-experiment': 'experiment',
      validating: 'validation',
      complete: 'validation',
    }
    const nextTab = tabByStep[currentStep]
    if (nextTab) setActiveTab(nextTab)
  }, [currentStep])

  const getTabStatus = (tab: ResultTab): TabStatus => {
    const loadingByTab: Partial<Record<typeof currentStep, ResultTab>> = {
      searching: 'papers',
      processing: 'papers',
      summarizing: 'summary',
      'analyzing-gaps': 'gaps',
      'generating-hypotheses': 'hypotheses',
      'planning-experiment': 'experiment',
      validating: 'validation',
    }

    if (loadingByTab[currentStep] === tab) return 'loading'
    if (tab === 'papers') return papers.length > 0 ? 'complete' : 'pending'
    if (tab === 'summary') return summary ? 'complete' : 'pending'
    if (tab === 'gaps') return gaps ? 'complete' : 'pending'
    if (tab === 'hypotheses') return hypotheses ? 'complete' : 'pending'
    if (tab === 'experiment') return experimentPlan || useCustomHypothesis ? 'complete' : 'pending'
    return validationResult ? 'complete' : 'pending'
  }

  // Main workflow orchestration
  const handleRunAIScientist = async () => {
    if (!topic.trim()) {
      showErrorToast('Error', 'Please enter a research topic')
      return
    }

    stopRequestedRef.current = false
    abortControllerRef.current = new AbortController()
    setIsStopping(false)

    try {
      setIsRunning(true)
      const signal = abortControllerRef.current.signal

      // Step 1: Search papers
      if (stopRequestedRef.current) return
      showSuccessToast('Starting', 'Searching for papers...')
      const foundPapers = await searchPapers(topic, numPapers, signal)

      if (stopRequestedRef.current) return
      if (foundPapers.length === 0) {
        showErrorToast('No Results', 'No papers found for this topic')
        return
      }

      showSuccessToast('Papers Found', `Found ${foundPapers.length} papers`)

      // Step 2: Process PDFs
      if (stopRequestedRef.current) return
      const extracted = await processPDFs(foundPapers, signal)

      if (stopRequestedRef.current) return
      if (extracted.length === 0) {
        showErrorToast('Error', 'Could not extract text from papers')
        return
      }

      // Step 3: Stream summary
      if (stopRequestedRef.current) return
      const summaryResult = await streamSummary(extracted, topic, modelName, signal)
      if (stopRequestedRef.current) return

      // Step 4: Stream gaps
      if (stopRequestedRef.current) return
      const gapsResult = await streamGaps(summaryResult || '', topic, modelName, signal)
      if (stopRequestedRef.current) return

      // Step 5: Stream hypotheses
      if (stopRequestedRef.current) return
      const hypothesesResult = await streamHypotheses(gapsResult, topic, modelName, signal)
      if (stopRequestedRef.current) return

      // Step 6: Stream experiment plan (unless using custom hypothesis)
      if (!useCustomHypothesis || !customHypothesis) {
        if (stopRequestedRef.current) return
        await streamExperiment(hypothesesResult || '', modelName, signal)
        if (stopRequestedRef.current) return
      }

      // Step 7: Validate hypothesis
      if (stopRequestedRef.current) return
      const hypothesisToValidate = useCustomHypothesis && customHypothesis ? customHypothesis : hypothesesResult || ''

      if (stopRequestedRef.current) return
      if (hypothesisToValidate && extracted.length > 0) {
        await validateHyp(hypothesisToValidate, extracted, topic, modelName, signal)
        if (stopRequestedRef.current) return
      }

      showSuccessToast('Complete', 'Analysis finished! Check results below.')
    } catch (err) {
      if (stopRequestedRef.current || (err instanceof DOMException && err.name === 'AbortError')) {
        return
      }
      const message = err instanceof Error ? err.message : 'An error occurred'
      showErrorToast('Error', message)
    } finally {
      setIsRunning(false)
      setIsStopping(false)
      stopRequestedRef.current = false
      abortControllerRef.current = null
    }
  }

  // Setup keyboard shortcuts (must be after function definitions)
  useKeyboardShortcuts({
    onRun: handleRunAIScientist,
    onExport: () => {
      if (papers.length > 0 || summary) {
        handleExport()
      }
    },
    onHelp: () => setShowHelpModal(true),
  })

  return (
    <>
      <main className="min-h-screen bg-background selection:bg-primary/30">
      {/* Premium Header Decoration */}
      <div className="absolute inset-x-0 top-0 h-[420px] pointer-events-none opacity-60">
        <div className="h-full w-full bg-[radial-gradient(circle_at_14%_12%,rgba(99,102,241,0.10),transparent_18%),radial-gradient(circle_at_82%_8%,rgba(34,211,238,0.08),transparent_20%),radial-gradient(circle_at_56%_34%,rgba(129,140,248,0.06),transparent_24%)] blur-xl" />
      </div>
      <div className="absolute inset-x-0 top-16 h-56 pointer-events-none opacity-35">
        <div className="mx-auto h-full max-w-6xl bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.12),transparent_22%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.08),transparent_24%),radial-gradient(circle_at_60%_70%,rgba(129,140,248,0.06),transparent_26%)] blur-2xl" />
      </div>
      
      {/* API Health Alert */}
      {isHealthy === false && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-3 duration-500">
          <div className="premium-panel rounded-[22px] border-destructive/20 bg-[linear-gradient(145deg,rgba(239,68,68,0.10),rgba(255,255,255,0.03))] px-4 py-3 shadow-[0_18px_40px_rgba(239,68,68,0.12)] max-w-sm">
            <div className="relative flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-destructive/80">
                  API Unavailable
                </p>
                <p className="mt-1 text-sm text-muted-foreground break-words">
                  {healthError}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-12 relative">
        <div className="premium-grid absolute inset-x-6 top-0 h-[420px] opacity-20 pointer-events-none" />
        {/* Header with Theme Toggle */}
        <div className="relative flex items-start justify-between mb-12 gap-6">
          <div className="space-y-4 max-w-3xl flex-1">
            <h1 className="text-5xl font-black tracking-tighter sm:text-6xl leading-none animate-reveal fill-mode-both">
              AI <span className="text-primary inline-block">Scientist</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed animate-reveal [animation-delay:200ms] fill-mode-both">
              Automated research discovery, gap analysis, and scientific validation 
              powered by <span className="text-foreground font-bold">CDM + NDI</span> metrics.
            </p>
          </div>
          <div className="animate-reveal [animation-delay:400ms] fill-mode-both">
            <ThemeToggle />
          </div>
        </div>

        {/* Workflow Progress (if running or has results) */}
        {(papers.length > 0 || currentStep !== 'idle') && (
          <div className="mb-8">
            <WorkflowProgress currentStep={currentStep} isComplete={currentStep === 'complete'} />
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Input Section */}
            <div className="premium-panel rounded-[34px] p-8 relative animate-reveal [animation-delay:600ms] fill-mode-both">
              <div className="premium-grid absolute inset-0 opacity-20" />
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
                <Zap className="h-32 w-32" />
              </div>
              
              <div className="relative space-y-6">
                <div className="animate-reveal [animation-delay:800ms] fill-mode-both">
                  <label className="block premium-label mb-3">
                    Research Topic
                  </label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Deep Learning in Oncology, Quantum Computing Stability..."
                    className="h-14 text-lg"
                    disabled={isRunning}
                  />
                </div>

                <div className="flex gap-4 animate-reveal [animation-delay:1000ms] fill-mode-both">
                  <Button
                    onClick={handleRunAIScientist}
                    disabled={isRunning || !isHealthy}
                    className={cn(
                      "flex-1 h-14 rounded-2xl text-lg font-bold transition-all duration-500 active:scale-[0.98]",
                      !isRunning ? "" : "bg-muted text-foreground shadow-none border border-border disabled:opacity-100 cursor-not-allowed"
                    )}
                    size="lg"
                  >
                    {isRunning ? (
                      <>
                        <LoadingSpinner className="mr-3" />
                        {getStepLabel(currentStep)}
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                        Initiate Research Workflow
                      </>
                    )}
                  </Button>

                  {isRunning && (
                    <Button
                      onClick={handleStopWorkflow}
                      variant="destructive"
                      className="h-14 w-14 rounded-2xl hover:bg-destructive/10 transition-all duration-200 hover:-translate-y-0.5 animate-in slide-in-from-right-4 duration-300"
                      title="Stop Workflow"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                  
                  {(papers.length > 0 || summary) && !isRunning && (
                    <Button
                      onClick={resetWorkflow}
                      variant="outline"
                      disabled={isRunning}
                      className="h-14 w-14 rounded-2xl hover:bg-foreground/5 transition-all duration-200 hover:-translate-y-0.5 animate-in slide-in-from-right-4 duration-300"
                      title="Reset Workflow"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                  )}
                  
                  {papers.length > 0 && (
                    <div className="animate-in slide-in-from-right-4 duration-500">
                      <ExportMenu
                        isDisabled={isRunning}
                        onExportMarkdown={() => generateMarkdownReport(topic, summary, gaps, hypotheses, experimentPlan, validationResult, papers)}
                        onExportJSON={() => JSON.stringify({ topic, summary, gaps, hypotheses, experimentPlan, validationResult, papers }, null, 2)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-6 animate-in zoom-in-95 duration-300">
                  <ErrorMessage
                    message={error}
                    onRetry={handleRunAIScientist}
                  />
                </div>
              )}
            </div>

            {/* Results Section */}
            {papers.length > 0 ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ResultTab)} className="space-y-6">
                  <div className="premium-panel rounded-[28px] p-2">
                    <TabsList className="w-full grid grid-cols-6 bg-transparent border-0 shadow-none p-0">
                      <TabsTrigger value="validation" className="text-xs sm:text-sm">
                        <TabStatusBadge status={getTabStatus('validation')} label="Validation" />
                      </TabsTrigger>
                      <TabsTrigger value="papers" className="text-xs sm:text-sm">
                        <TabStatusBadge status={getTabStatus('papers')} label="Papers" preview={papers.length ? String(papers.length) : undefined} />
                      </TabsTrigger>
                      <TabsTrigger value="summary" className="text-xs sm:text-sm">
                        <TabStatusBadge status={getTabStatus('summary')} label="Summary" />
                      </TabsTrigger>
                      <TabsTrigger value="gaps" className="text-xs sm:text-sm">
                        <TabStatusBadge status={getTabStatus('gaps')} label="Gaps" />
                      </TabsTrigger>
                      <TabsTrigger value="hypotheses" className="text-xs sm:text-sm">
                        <TabStatusBadge status={getTabStatus('hypotheses')} label="Hypotheses" />
                      </TabsTrigger>
                      <TabsTrigger value="experiment" className="text-xs sm:text-sm">
                        <TabStatusBadge status={getTabStatus('experiment')} label="Experiment" />
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Validation Tab */}
                  <TabsContent value="validation" className="outline-none motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500">
                    {isRunning && !validationResult ? (
                      <ResultSection title="Hypothesis Validation" icon={<Target className="h-5 w-5" />}>
                        <div className="premium-card rounded-[24px] p-12 text-center border-dashed border-border/50">
                          <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                              <Target className="h-12 w-12 text-primary/50 animate-pulse" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-lg font-semibold text-primary">Validating Hypothesis</p>
                              <p className="text-sm text-muted-foreground">
                                Analyzing scientific validity using CDM and NDI metrics...
                              </p>
                            </div>
                          </div>
                        </div>
                      </ResultSection>
                    ) : isLoading && currentStep === 'validating' ? (
                      <ResultSection title="Hypothesis Validation" icon={<Target className="h-5 w-5" />}>
                        <ResultSkeleton />
                      </ResultSection>
                    ) : error && currentStep === 'validating' ? (
                      <ErrorMessage
                        title="Validation Failed"
                        message={error}
                        onRetry={async () => {
                          const hypothesisToValidate = useCustomHypothesis && customHypothesis ? customHypothesis : hypotheses || ''
                          if (hypothesisToValidate && extractedData.length > 0) {
                            try {
                              await validateHyp(hypothesisToValidate, extractedData, topic, modelName)
                            } catch (err) {
                              console.error('Retry failed:', err)
                            }
                          }
                        }}
                      />
                    ) : validationResult ? (
                      <div className="space-y-8">
                        <ResultSection
                          title="Scientific Validation Report"
                          icon={<ShieldCheck className="h-5 w-5" />}
                          actions={<ValidationBadge classification={validationResult.classification} />}
                        >
                          <div className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              <MetricCard
                                label="Stability"
                                value={validationResult.metrics.stability_score}
                                description="Consistency of supporting evidence across the corpus"
                                icon={<ShieldCheck className="h-5 w-5" />}
                                color="blue"
                              />
                              <MetricCard
                                label="Novelty"
                                value={validationResult.metrics.novelty_score}
                                description="Distance from existing literature and prior claims"
                                icon={<Sparkles className="h-5 w-5" />}
                                color="purple"
                              />
                              <MetricCard
                                label="Viability"
                                value={validationResult.metrics.viability_score}
                                description="Overall potential after balancing strength and originality"
                                icon={<Target className="h-5 w-5" />}
                                color="pink"
                              />
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                              <div className="premium-card rounded-[28px] p-6">
                                <div className="mb-5 flex items-center gap-3">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-300">
                                    <AlertCircle className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-bold text-foreground">Domain Fragmentation (CDM)</h3>
                                    <p className="text-sm text-muted-foreground">Support, contradiction, and neutral evidence breakdown</p>
                                  </div>
                                </div>
                                <CDMResultDisplay cdm={validationResult.cdm} />
                              </div>

                              <div className="flex flex-col gap-6 w-full">
                                <div className="premium-card rounded-[28px] p-6 h-fit">
                                  <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                                      <Fingerprint className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-bold text-foreground">Novelty Distance (NDI)</h3>
                                      <p className="text-sm text-muted-foreground">Similarity and novelty interpretation against retrieved evidence</p>
                                    </div>
                                  </div>
                                  <NDIResultDisplay ndi={validationResult.ndi} />
                                </div>
                                <div className="premium-card rounded-[28px] p-6 h-fit">
                                  <div className="mb-2 flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                      <Target className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-bold text-foreground">Validation Profile</h3>
                                      <p className="text-sm text-muted-foreground">Triangular mapping of Stability, Novelty, and Viability</p>
                                    </div>
                                  </div>
                                  <MetricsRadarDisplay metrics={validationResult.metrics} />
                                </div>
                              </div>
                            </div>
                          </div>

                        </ResultSection>
                      </div>
                    ) : (
                      <div className="premium-card rounded-[24px] p-12 text-center border-dashed border-border/50">
                        <p className="text-muted-foreground font-medium">
                          Run the research workflow to generate validation metrics.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Papers Tab */}
                  <TabsContent value="papers" className="outline-none motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500">
                    {isRunning && papers.length === 0 ? (
                      <ResultSection title="Discovery Corpus" icon={<BookOpen className="h-5 w-5" />}>
                        <div className="premium-card rounded-[24px] p-12 text-center border-dashed border-border/50">
                          <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                              <BookOpen className="h-12 w-12 text-primary/50 animate-pulse" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-lg font-semibold text-primary">Searching Papers</p>
                              <p className="text-sm text-muted-foreground">
                                Discovering relevant research papers from academic databases...
                              </p>
                            </div>
                          </div>
                        </div>
                      </ResultSection>
                    ) : (
                      <ResultSection
                        title={`Discovery Corpus (${papers.length})`}
                        icon={<BookOpen className="h-5 w-5" />}
                      >
                        <EnhancedPaperList papers={papers} isLoading={isLoading && currentStep === 'searching'} />
                      </ResultSection>
                    )}
                  </TabsContent>

                  {/* Summary Tab */}
                  <TabsContent value="summary" className="outline-none motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500">
                    {isRunning && !summary ? (
                      <ResultSection title="Research Summary" icon={<BookOpen className="h-5 w-5" />}>
                        <div className="premium-card rounded-[24px] p-12 text-center border-dashed border-border/50">
                          <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                              <BookOpen className="h-12 w-12 text-primary/50 animate-pulse" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-lg font-semibold text-primary">Generating Summary</p>
                              <p className="text-sm text-muted-foreground">
                                Analyzing and synthesizing research findings from discovered papers...
                              </p>
                            </div>
                          </div>
                        </div>
                      </ResultSection>
                    ) : (
                      <ResultSection
                        title="Research Summary"
                        icon={<BookOpen className="h-5 w-5" />}
                        contentToCopy={summary || ''}
                      >
                        {isLoading && currentStep === 'summarizing' && !summary ? (
                          <ResultSkeleton />
                        ) : (
                          <ResultContent content={summary || ''} isStreaming={isLoading && currentStep === 'summarizing'} />
                        )}
                      </ResultSection>
                    )}
                  </TabsContent>

                  {/* Gaps Tab */}
                  <TabsContent value="gaps" className="outline-none motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500">
                    {isRunning && !gaps ? (
                      <ResultSection title="Identified Research Gaps" icon={<Zap className="h-5 w-5" />}>
                        <div className="premium-card rounded-[24px] p-12 text-center border-dashed border-border/50">
                          <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                              <Zap className="h-12 w-12 text-primary/50 animate-pulse" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-lg font-semibold text-primary">Analyzing Gaps</p>
                              <p className="text-sm text-muted-foreground">
                                Identifying knowledge gaps and research opportunities...
                              </p>
                            </div>
                          </div>
                        </div>
                      </ResultSection>
                    ) : (
                      <ResultSection
                        title="Identified Research Gaps"
                        icon={<Zap className="h-5 w-5" />}
                        contentToCopy={gaps || ''}
                      >
                        {isLoading && currentStep === 'analyzing-gaps' && !gaps ? (
                          <ResultSkeleton />
                        ) : (
                          <ResultContent content={gaps || ''} isStreaming={isLoading && currentStep === 'analyzing-gaps'} />
                        )}
                      </ResultSection>
                    )}
                  </TabsContent>

                  {/* Hypotheses Tab */}
                  <TabsContent value="hypotheses" className="outline-none motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500">
                    {isRunning && !hypotheses ? (
                      <ResultSection title="Candidate Hypotheses" icon={<Lightbulb className="h-5 w-5" />}>
                        <div className="premium-card rounded-[24px] p-12 text-center border-dashed border-border/50">
                          <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                              <Lightbulb className="h-12 w-12 text-primary/50 animate-pulse" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-lg font-semibold text-primary">Generating Hypotheses</p>
                              <p className="text-sm text-muted-foreground">
                                Formulating testable research hypotheses based on identified gaps...
                              </p>
                            </div>
                          </div>
                        </div>
                      </ResultSection>
                    ) : (
                      <ResultSection
                        title="Candidate Hypotheses"
                        icon={<Lightbulb className="h-5 w-5" />}
                        contentToCopy={hypotheses || ''}
                      >
                        {isLoading && currentStep === 'generating-hypotheses' && !hypotheses ? (
                          <ResultSkeleton />
                        ) : (
                          <ResultContent content={hypotheses || ''} isStreaming={isLoading && currentStep === 'generating-hypotheses'} />
                        )}
                      </ResultSection>
                    )}
                  </TabsContent>

                  {/* Experiment Tab */}
                  <TabsContent value="experiment" className="outline-none motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500">
                    {isRunning && !experimentPlan ? (
                      <ResultSection title="Experimentation Plan" icon={<TestTube className="h-5 w-5" />}>
                        <div className="glass-card rounded-2xl p-12 text-center border-dashed border-border/50">
                          <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                              <TestTube className="h-12 w-12 text-primary/50 animate-pulse" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-lg font-semibold text-primary">Planning Experiments</p>
                              <p className="text-sm text-muted-foreground">
                                Designing experimental protocols and methodologies...
                              </p>
                            </div>
                          </div>
                        </div>
                      </ResultSection>
                    ) : (
                      <ResultSection
                        title="Experimentation Plan"
                        icon={<TestTube className="h-5 w-5" />}
                        contentToCopy={experimentPlan || ''}
                      >
                        {isLoading && currentStep === 'planning-experiment' && !experimentPlan ? (
                          <ResultSkeleton />
                        ) : experimentPlan ? (
                          <ResultContent content={experimentPlan} isStreaming={isLoading && currentStep === 'planning-experiment'} />
                        ) : useCustomHypothesis ? (
                          <div className="premium-card rounded-[24px] p-8 border-dashed border-border text-center">
                            <p className="text-sm text-muted-foreground italic">
                              Experiment generation skipped (Manual Hypothesis Mode active)
                            </p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground italic text-center p-8">No plan generated yet.</p>
                        )}
                      </ResultSection>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <EmptyState onSelectExample={setTopic} />
            )}
          </div>
        </div>
      </div>
    </main>

    <KeyboardShortcutsModal 
      isOpen={showHelpModal} 
      onClose={() => setShowHelpModal(false)} 
    />
    </>
  )
}

