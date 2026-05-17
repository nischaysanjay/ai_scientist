'use client'

import { useWorkflowStore } from '@/lib/store'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { QuickStatsCard } from '@/components/quick-stats-card'
import {
  Settings2,
  Zap,
  FlaskConical,
} from 'lucide-react'

export function Sidebar() {
  const {
    numPapers,
    setNumPapers,
    modelName,
    setModelName,
    useCustomHypothesis,
    setUseCustomHypothesis,
    customHypothesis,
    setCustomHypothesis,
    papers,
    currentStep,
    isLoading,
  } = useWorkflowStore()

  const isWorkflowActive = isLoading || (currentStep !== 'idle' && currentStep !== 'complete')

  return (
    <aside className="lg:col-span-1 space-y-6 self-start">
      <div className="space-y-6">
        <div className="premium-panel rounded-[30px] p-6 animate-reveal [animation-delay:100ms]">
          <div className="relative space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="premium-label">Control Center</div>
                <h2 className="text-xl font-black tracking-tight text-foreground">Configuration</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <Settings2 className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="premium-card rounded-[24px] p-4">
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="num-papers" className="text-sm font-semibold text-muted-foreground">
                      Number of Papers
                    </Label>
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black tracking-[0.2em] text-primary">
                      {numPapers}
                    </span>
                  </div>
                  <Slider
                    id="num-papers"
                    min={1}
                    max={20}
                    step={1}
                    value={[numPapers]}
                    onValueChange={(value) => setNumPapers(value[0])}
                    className="w-full opacity-90"
                    disabled={isWorkflowActive}
                  />
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/65">
                    Maximum search depth
                  </p>
                </div>
              </div>

              <div className="premium-card rounded-[24px] p-4">
                <div className="relative space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <Label htmlFor="model" className="text-sm font-semibold text-muted-foreground">
                      LLM Engine
                    </Label>
                  </div>
                  <Select value={modelName} onValueChange={setModelName}>
                    <SelectTrigger id="model" disabled={isWorkflowActive}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mistral">Mistral</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/65">
                    Local-first inference
                  </div>
                </div>
              </div>

              <div className="premium-card rounded-[22px] p-3.5">
                <div className="relative space-y-3">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold tracking-tight text-foreground">Hypothesis Override</h3>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-muted/30 px-3 py-2.5 transition-all hover:border-primary/30 hover:bg-muted/50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-primary/20 dark:hover:bg-white/[0.05]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="use-custom"
                          className="text-xs font-semibold uppercase tracking-[0.22em] select-none text-muted-foreground"
                        >
                          Manual Entry Mode
                        </Label>
                        <p className="text-[10px] text-muted-foreground/75">
                          Use your own hypothesis
                        </p>
                      </div>
                      <Switch
                        id="use-custom"
                        checked={useCustomHypothesis}
                        onCheckedChange={(checked) => setUseCustomHypothesis(checked === true)}
                        disabled={isWorkflowActive}
                      />
                    </div>
                  </div>

                  {useCustomHypothesis && (
                    <div className="space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-500 fill-mode-both">
                      <Textarea
                        placeholder="Enter your research hypothesis here..."
                        value={customHypothesis || ''}
                        onChange={(e) => setCustomHypothesis(e.target.value)}
                        className="min-h-[112px] text-sm"
                        disabled={isWorkflowActive}
                      />

                      {customHypothesis && (
                        <div className="rounded-xl border border-primary/16 bg-primary/[0.06] p-3 text-[12px] leading-relaxed">
                          <p className="premium-label mb-1.5 text-primary/90">Preview</p>
                          <p className="line-clamp-4 italic text-muted-foreground">&quot;{customHypothesis}&quot;</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-reveal [animation-delay:300ms]">
          <QuickStatsCard
            papersFound={papers.length}
            currentStep={currentStep}
            isLoading={isLoading}
          />
        </div>
      </div>
    </aside>
  )
}
