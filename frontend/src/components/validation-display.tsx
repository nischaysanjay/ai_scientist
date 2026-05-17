'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/cn'
import { CDMResult, NDIResult, ValidationMetrics } from '@/types'
import { PieChart, Pie, Cell, Tooltip, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import {
  Fingerprint,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface ValidationBadgeProps {
  classification: 'Strong & Novel' | 'Novel but Weak' | 'Stable but Known' | 'Weak & Redundant'
}

export function ValidationBadge({ classification }: ValidationBadgeProps) {
  const variants = {
    'Strong & Novel': 'bg-green-500/20 text-green-400 border-green-500/50',
    'Novel but Weak': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    'Stable but Known': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    'Weak & Redundant': 'bg-red-500/20 text-red-400 border-red-500/50',
  }

  return (
    <Badge variant="outline" className={cn('text-sm py-1.5 px-4 font-semibold border-2 rounded-full', variants[classification])}>
      {classification}
    </Badge>
  )
}

interface MetricCardProps {
  label: string
  value: number
  description?: string
  icon: React.ReactNode
  color: 'purple' | 'blue' | 'cyan' | 'pink'
}

export function MetricCard({ label, value, description, icon, color }: MetricCardProps) {
  const colorMap = {
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-700 dark:text-purple-400',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-700 dark:text-blue-400',
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-700 dark:text-cyan-400',
    pink: 'from-pink-500/20 to-pink-500/5 border-pink-500/30 text-pink-700 dark:text-pink-400',
  }

  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border p-5 bg-gradient-to-br shadow-md animate-reveal hover:shadow-lg hover:shadow-primary/10 transition-all duration-300',
      colorMap[color]
    )}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</span>
        <div className="p-2 rounded-lg bg-background/50 border border-border/40">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-black tracking-tight mb-1">
        {(value * 100).toFixed(1)}<span className="text-lg font-medium opacity-50">%</span>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground font-medium">{description}</p>
      )}
      <div className="absolute -right-4 -bottom-4 w-16 h-16 opacity-10 rotate-12">
        {icon}
      </div>
    </div>
  )
}

export function CDMResultDisplay({ cdm }: { cdm: CDMResult }) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-orange-500/10 dark:bg-orange-500/12 border border-orange-500/25 animate-reveal [animation-delay:400ms] fill-mode-both">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-300" />
          <h4 className="font-bold text-foreground">Conflict Summary</h4>
        </div>
        <p className="text-sm text-foreground/80 italic leading-relaxed">
          &quot;{cdm.conflict_summary}&quot;
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/8 dark:bg-red-500/12 border border-red-500/20 dark:border-red-400/20">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Conflicts</div>
            <div className="text-lg font-black text-red-600 dark:text-red-400">{cdm.contradictions}</div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/8 dark:bg-green-500/12 border border-green-500/20 dark:border-green-400/20">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Support</div>
            <div className="text-lg font-black text-green-600 dark:text-green-400">{cdm.neutral_chunks}</div>
          </div>
        </div>
        <div className="flex items-center justify-center w-full min-h-[192px]">
            <PieChart width={220} height={180}>
              <Pie
                data={[
                  { name: 'Conflicts', value: cdm.contradictions, color: '#ef4444' },
                  { name: 'Support', value: cdm.neutral_chunks, color: '#10b981' },
                ].filter(d => d.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {[
                  { name: 'Conflicts', value: cdm.contradictions, color: '#ef4444' },
                  { name: 'Support', value: cdm.neutral_chunks, color: '#10b981' },
                ].filter(d => d.value > 0).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
        </div>
      </div>

      <div className="space-y-3">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="contradictions" className="border-none">
            <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2 px-0">
              <div className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4" />
                Deep Dive: Pairwise Evidence ({cdm.details.length} items)
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              {cdm.details.map((detail, i) => (
                <div
                  key={i}
                  className="glass-card p-4 rounded-xl relative overflow-hidden group animate-reveal fill-mode-both hover:shadow-primary/10 transition-all duration-300"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-3 text-reveal">
                    <div className="flex items-center gap-2">
                      {detail.classification === 'CONTRADICT' ? (
                        <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/50 animate-in zoom-in-50 duration-300">
                          CONTRADICT
                        </Badge>
                      ) : detail.classification === 'SUPPORT' ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50 animate-in zoom-in-50 duration-300">
                          SUPPORT
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground animate-in zoom-in-50 duration-300">
                          NEUTRAL
                        </Badge>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground group-hover:text-primary transition-colors">Chunk Pair #{i + 1}</div>
                  </div>

                  <div className="space-y-2 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="flex gap-2">
                      <div className="w-1 h-auto bg-primary/20 rounded-full group-hover:bg-primary transition-colors" />
                      <p className="text-xs font-medium text-foreground/90 italic">
                        {detail.raw_response}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <ExternalLink className="h-3 w-3" />
                      <span className="truncate max-w-[200px]">{detail.source}</span>
                    </div>
                  </div>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}

export function NDIResultDisplay({ ndi }: { ndi: NDIResult }) {
  return (
    <div className="p-5 rounded-2xl bg-cyan-500/8 dark:bg-cyan-500/12 border border-cyan-500/25 dark:border-cyan-400/25 space-y-4">
      <div className="flex items-center gap-3">
        <Fingerprint className="h-6 w-6 text-cyan-600 dark:text-cyan-300" />
        <div>
          <h4 className="font-bold text-foreground">{ndi.novelty}</h4>
          <p className="text-xs text-muted-foreground">Analysis based on embedding distance</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <span>Similarity with Literature</span>
          <span>{(ndi.max_similarity * 100).toFixed(1)}%</span>
        </div>
        <div className="relative h-2 w-full bg-cyan-950 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.6)] transition-all duration-1000 relative"
            style={{ width: `${ndi.max_similarity * 100}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent shine-slow" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full mt-2">
        <PieChart width={220} height={110}>
          <Pie
            data={[
              { name: 'Novelty Score', value: ndi.ndi_score * 100, color: '#06b6d4' },
              { name: 'Remainder', value: 100 - (ndi.ndi_score * 100), color: 'rgba(6, 182, 212, 0.15)' }
            ]}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={70}
            outerRadius={90}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            {[
              { name: 'Novelty Score', value: ndi.ndi_score * 100, color: '#06b6d4' },
              { name: 'Remainder', value: 100 - (ndi.ndi_score * 100), color: 'rgba(6, 182, 212, 0.15)' }
            ].map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
        <div className="text-center mt-[-30px] mb-4">
          <span className="text-3xl font-black text-cyan-600 dark:text-cyan-400">{(ndi.ndi_score * 100).toFixed(1)}%</span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Novelty Distance</p>
        </div>
      </div>

      <p className="text-xs text-foreground/80 leading-relaxed italic">
        An NDI score of <span className="text-cyan-700 dark:text-cyan-300 font-bold">{(ndi.ndi_score * 100).toFixed(1)}%</span> indicates
        {' '}
        that this hypothesis is <span className="text-cyan-700 dark:text-cyan-300 font-bold">{ndi.ndi_score > 0.4 ? 'highly radical' : 'evolutionary'}</span>
        {' '}
        compared to the top 5 most relevant chunks discovered in the current corpus.
      </p>
    </div>
  )
}

export function MetricsRadarDisplay({ metrics }: { metrics: ValidationMetrics }) {
  const radarData = [
    { subject: 'Stability', A: metrics.stability_score * 100, fullMark: 100 },
    { subject: 'Novelty', A: metrics.novelty_score * 100, fullMark: 100 },
    { subject: 'Viability', A: metrics.viability_score * 100, fullMark: 100 },
  ]

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[220px]">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" width={280} height={240} data={radarData}>
        <PolarGrid stroke="rgba(255,255,255,0.15)" />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 'bold' }}
          className="text-muted-foreground uppercase opacity-80"
        />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="Score"
          dataKey="A"
          stroke="#8b5cf6"
          strokeWidth={2}
          fill="#8b5cf6"
          fillOpacity={0.35}
        />
        <Tooltip 
          contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '12px' }}
          itemStyle={{ color: '#fff' }}
          formatter={(value) => [typeof value === 'number' ? `${value.toFixed(1)}%` : 'N/A', 'Score']}
        />
      </RadarChart>
    </div>
  )
}
