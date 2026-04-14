'use client'

import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from 'recharts'
import { ValidationMetrics, CDMResult, NDIResult } from '@/types'
import { ShieldCheck, Fingerprint, AlertTriangle } from 'lucide-react'

interface MetricsChartsProps {
  metrics: ValidationMetrics
  cdm: CDMResult
  ndi: NDIResult
}

function ChartCard({
  title,
  description,
  icon,
  children,
  footer,
}: {
  title: string
  description: string
  icon: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="premium-card flex h-[29rem] flex-col rounded-[32px] p-7 transition-all duration-500 hover:shadow-primary/20">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-glow shadow-primary/20">
          {icon}
        </div>
        <div>
          <h4 className="text-xl font-black tracking-tight text-foreground">{title}</h4>
          <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-widest">{description}</p>
        </div>
      </div>
      <div className="min-h-0 flex-1 relative rounded-[28px] border border-white/5 bg-black/5 px-2 py-3 dark:bg-white/[0.02]">
        {children}
      </div>
      {footer ? <div className="mt-5">{footer}</div> : null}
    </div>
  )
}

function ChartStatRow({
  items,
}: {
  items: Array<{ label: string; value: string; dotColor?: string }>
}) {
  return (
    <div className={`grid gap-2 ${items.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className="glass flex min-h-16 flex-col items-center justify-center rounded-2xl border-white/10 px-2 py-2.5 text-center transition-all duration-300 hover:bg-primary/5"
        >
          <div className="mb-1 flex items-center gap-1.5">
            {item.dotColor ? (
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.dotColor }} />
            ) : null}
            <span className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/60">
              {item.label}
            </span>
          </div>
          <span className="text-sm font-black tabular-nums text-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; color?: string; payload?: { metric?: string; name?: string } }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  const item = payload[0]
  const name = item.payload?.metric ?? item.payload?.name ?? item.name ?? label
  const value = typeof item.value === 'number' ? `${item.value.toFixed(1)}%` : item.value

  return (
    <div className="glass-card rounded-2xl border-primary/20 px-4 py-3 shadow-2xl shadow-black/40">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 mb-1">{name}</p>
      <p className="text-xl font-black text-foreground drop-shadow-sm">{value}</p>
    </div>
  )
}

export function MetricsRadarChart({ metrics }: { metrics: ValidationMetrics }) {
  const data = [
    { metric: 'Stability', value: metrics.stability_score * 100 },
    { metric: 'Novelty', value: metrics.novelty_score * 100 },
    { metric: 'Viability', value: metrics.viability_score * 100 },
  ]

  return (
    <ChartCard
      title="Metrics Radar"
      description="Core Validation Dimensions"
      icon={<ShieldCheck className="h-6 w-6" />}
      footer={
        <ChartStatRow
          items={data.map((item) => ({
            label: item.metric,
            value: `${item.value.toFixed(1)}%`,
          }))}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 12, right: 28, left: 28, bottom: 12 }}>
          <defs>
            <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-neon-cyan)" />
              <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
            <radialGradient id="radarFill" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--color-neon-cyan)" stopOpacity={0.1} />
            </radialGradient>
          </defs>
          <PolarGrid strokeDasharray="3 3" stroke="hsl(var(--foreground)/0.12)" strokeWidth={1} />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ 
              fontSize: 11, 
              fontWeight: 800, 
              fill: 'hsl(var(--muted-foreground))',
              letterSpacing: '0.1em'
            }}
          />
          <PolarRadiusAxis axisLine={false} tick={false} domain={[0, 100]} />
          <Tooltip content={<ChartTooltip />} />
          <Radar 
            dataKey="value" 
            stroke="url(#radarStroke)" 
            strokeWidth={3} 
            fill="url(#radarFill)" 
            isAnimationActive={true}
            animationDuration={1500}
            dot={{ r: 5, strokeWidth: 2, fill: 'hsl(var(--background))', stroke: 'url(#radarStroke)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function CDMChart({ cdm }: { cdm: CDMResult }) {
  const data = [
    { name: 'Support', value: cdm.supporting_chunks, color: '#10b981', grad: 'supportGrad' },
    { name: 'Conflicts', value: cdm.contradictions, color: '#ef4444', grad: 'conflictGrad' },
    { name: 'Neutral', value: cdm.neutral_chunks, color: '#6b7280', grad: 'neutralGrad' },
  ]
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <ChartCard
      title="CDM Distribution"
      description="Evidence Breakdown"
      icon={<AlertTriangle className="h-6 w-6" />}
      footer={
        <ChartStatRow
          items={data.map((entry) => ({
            label: entry.name,
            value: String(entry.value),
            dotColor: entry.color,
          }))}
        />
      }
    >
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1 pb-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <defs>
                <linearGradient id="supportGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="conflictGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
                <linearGradient id="neutralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={66}
                outerRadius={102}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                isAnimationActive={true}
                animationDuration={1500}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cdm-${index}`} 
                    fill={`url(#${entry.grad})`} 
                    className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                  />
                ))}
              </Pie>
              <text
                x="50%"
                y="47%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]"
              >
                Evidence
              </text>
              <text
                x="50%"
                y="58%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground text-4xl font-black tabular-nums"
              >
                {total}
              </text>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartCard>
  )
}

export function NDIChart({ ndi }: { ndi: NDIResult }) {
  const data = [
    { metric: 'Similarity', value: ndi.max_similarity * 100, grad: 'similarityGrad' },
    { metric: 'Novelty', value: ndi.ndi_score * 100, grad: 'noveltyGrad' },
  ]

  return (
    <ChartCard
      title="NDI Comparison"
      description="Literature vs distance"
      icon={<Fingerprint className="h-6 w-6" />}
      footer={
        <ChartStatRow
          items={data.map((item) => ({
            label: item.metric,
            value: `${item.value.toFixed(1)}%`,
          }))}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 14, right: 40, left: 0, bottom: 14 }}
          barCategoryGap={20}
        >
          <defs>
            <linearGradient id="similarityGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-neon-cyan)" />
              <stop offset="100%" stopColor="var(--color-neon-blue)" />
            </linearGradient>
            <linearGradient id="noveltyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-neon-purple)" />
              <stop offset="100%" stopColor="var(--color-neon-pink)" />
            </linearGradient>
          </defs>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="metric"
            width={85}
            tick={{ 
              fontSize: 10, 
              fontWeight: 900, 
              fill: 'hsl(var(--muted-foreground))', 
              style: { textTransform: 'uppercase', letterSpacing: '0.05em' }
            }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--primary)/0.05)', radius: 12 }} />
          <Bar 
            dataKey="value" 
            radius={[0, 12, 12, 0]} 
            barSize={32}
            isAnimationActive={true}
            animationDuration={1500}
            background={{ fill: 'hsl(var(--foreground)/0.03)', radius: 12 }}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`ndi-${index}`} 
                fill={`url(#${entry.grad})`}
              />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              offset={15}
              formatter={(value: any) => `${Number(value).toFixed(1)}%`}
              className="fill-foreground text-xs font-black tabular-nums"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function MetricsCharts({ metrics, cdm, ndi }: MetricsChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <MetricsRadarChart metrics={metrics} />
      <CDMChart cdm={cdm} />
      <NDIChart ndi={ndi} />
    </div>
  )
}
