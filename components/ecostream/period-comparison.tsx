'use client'

/**
 * Comparative Period Analytics Engine.
 *
 * Mode `side-by-side` menampilkan Baseline (Jan–Jun 2026) dan Implementation
 * Start (Jul 2026–sekarang) berdampingan pada satu layar. Agar tidak memaksa
 * scroll vertikal panjang, hanya SATU jenis grafik yang aktif pada satu waktu
 * dan dirender kembar di kedua kolom — perbandingan tetap sejajar secara visual.
 */

import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import {
  COMPOST_COLOR,
  INORGANIC_STREAM_COLORS,
  STREAM_TOKENS,
} from '@/lib/design-tokens'
import { PERIOD_SUMMARIES, type PeriodKey, type PeriodSummary } from '@/lib/eco-data'
import {
  DLH_RESIDUE_LIMIT_PERCENT,
  formatPercent,
  formatTon,
  kgToTon,
  roundTo,
} from '@/lib/mass-balance'
import { ComplianceIndicator } from './status-indicator'

type ViewMode = 'side-by-side' | PeriodKey
type ChartKind = 'composition' | 'compost' | 'materials' | 'residue'

const CHART_KINDS: readonly { key: ChartKind; label: string; description: string }[] = [
  {
    key: 'composition',
    label: 'Komposisi Timbulan',
    description: 'Porsi organik, guna ulang, daur ulang, B3, dan residu dari total timbulan.',
  },
  {
    key: 'compost',
    label: 'Organik vs Kompos',
    description: 'Organik masuk komposter Nursery dibanding kompos matang yang dipanen.',
  },
  {
    key: 'materials',
    label: '7 Material Anorganik',
    description: 'Distribusi tujuh material anorganik terpisah Guna Ulang vs Daur Ulang.',
  },
  {
    key: 'residue',
    label: 'Tren Residu ke TPA',
    description: 'Rasio residu bulanan terhadap plafon maksimum 30% DLH Kota Bontang.',
  },
]

const chartConfig = {
  organicKg: { label: 'Organik masuk (ton)', color: STREAM_TOKENS.organic.color },
  compostKg: { label: 'Kompos dipanen (ton)', color: COMPOST_COLOR },
  reuseKg: { label: 'Guna Ulang (ton)', color: INORGANIC_STREAM_COLORS.reuse },
  recycleKg: { label: 'Daur Ulang (ton)', color: INORGANIC_STREAM_COLORS.recycle },
  residuePercent: { label: 'Rasio residu (%)', color: STREAM_TOKENS.residue.color },
} satisfies ChartConfig

function compositionOf(summary: PeriodSummary) {
  const { aggregate } = summary
  return [
    { name: 'Organik', value: kgToTon(aggregate.organicKg, 2), color: STREAM_TOKENS.organic.color },
    {
      name: 'Anorganik — Daur Ulang',
      value: kgToTon(aggregate.inorganicRecycleKg, 2),
      color: INORGANIC_STREAM_COLORS.recycle,
    },
    {
      name: 'Anorganik — Guna Ulang',
      value: kgToTon(aggregate.inorganicReuseKg, 2),
      color: INORGANIC_STREAM_COLORS.reuse,
    },
    { name: 'Limbah B3', value: kgToTon(aggregate.b3Kg, 2), color: STREAM_TOKENS.b3.color },
    {
      name: 'Residu ke TPA',
      value: kgToTon(aggregate.residueKg, 2),
      color: STREAM_TOKENS.residue.color,
    },
  ]
}

function PeriodChart({ summary, kind }: { summary: PeriodSummary; kind: ChartKind }) {
  const monthly = useMemo(
    () =>
      summary.monthly.map((point) => ({
        month: point.month,
        organicKg: kgToTon(point.organicKg, 2),
        compostKg: kgToTon(point.compostKg, 2),
        residuePercent: point.residuePercent,
      })),
    [summary],
  )

  const materials = useMemo(
    () =>
      summary.materials.map((point) => ({
        material: point.material,
        reuseKg: kgToTon(point.reuseKg, 2),
        recycleKg: kgToTon(point.recycleKg, 2),
      })),
    [summary],
  )

  const composition = useMemo(() => compositionOf(summary), [summary])

  if (kind === 'composition') {
    return (
      <div>
        <div className="relative">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[260px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={composition}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={2}
              isAnimationActive={false}
            >
              {composition.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="var(--background)" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="numeric text-2xl font-bold">{formatTon(summary.aggregate.totalKg)}</span>
          <span className="text-[11px] text-muted-foreground">
            Total ton · {summary.monthly.length} bln
          </span>
        </div>
        </div>
        <ul className="mt-3 space-y-1.5">
          {composition.map((entry) => (
            <li key={entry.name} className="flex items-center gap-2 text-xs">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="truncate text-muted-foreground">{entry.name}</span>
              <span className="numeric ml-auto font-semibold">{entry.value.toFixed(2)} t</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (kind === 'compost') {
    return (
      <ChartContainer config={chartConfig} className="aspect-[4/3] max-h-[320px] w-full">
        <BarChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} unit=" t" width={56} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="organicKg" fill="var(--color-organicKg)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="compostKg" fill="var(--color-compostKg)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ChartContainer>
    )
  }

  if (kind === 'materials') {
    return (
      <ChartContainer config={chartConfig} className="aspect-[4/3] max-h-[320px] w-full">
        <BarChart layout="vertical" data={materials} margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" tickLine={false} axisLine={false} unit=" t" />
          <YAxis
            dataKey="material"
            type="category"
            width={86}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="reuseKg" stackId="material" fill="var(--color-reuseKg)" isAnimationActive={false} />
          <Bar
            dataKey="recycleKg"
            stackId="material"
            fill="var(--color-recycleKg)"
            radius={[0, 4, 4, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-[4/3] max-h-[320px] w-full">
      <AreaChart data={monthly} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`residue-${summary.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-residuePercent)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-residuePercent)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis domain={[0, 40]} tickLine={false} axisLine={false} unit="%" width={52} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ReferenceLine
          y={DLH_RESIDUE_LIMIT_PERCENT}
          stroke="var(--compliance-danger)"
          strokeDasharray="6 4"
          strokeWidth={2}
          label={{
            value: `Batas DLH ${DLH_RESIDUE_LIMIT_PERCENT.toFixed(1)}%`,
            position: 'insideTopRight',
            fill: 'var(--compliance-danger)',
            fontSize: 11,
          }}
        />
        <Area
          type="monotone"
          dataKey="residuePercent"
          stroke="var(--color-residuePercent)"
          strokeWidth={2.5}
          fill={`url(#residue-${summary.key})`}
          dot={{ r: 3 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}

function PeriodPanel({
  summary,
  kind,
  highlight,
}: {
  summary: PeriodSummary
  kind: ChartKind
  highlight?: boolean
}) {
  return (
    <Card className={cn('h-full', highlight && 'border-2 border-[var(--stream-inorganic)]')}>
      <CardHeader className="gap-1 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">{summary.shortLabel}</CardTitle>
          <Badge variant="outline" className="numeric">
            {summary.rangeLabel}
          </Badge>
        </div>
        <CardDescription>{summary.label}</CardDescription>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <ComplianceIndicator
            level={summary.aggregate.complianceLevel}
            residuePercent={summary.aggregate.residuePercent}
          />
          <Badge variant="secondary" className="numeric">
            Recovery {formatPercent(summary.aggregate.recoveryPercent)}
          </Badge>
          {/* Kedua periode berbeda panjang (6 vs 3 bulan), jadi rata-rata per
              bulan ditampilkan agar total absolut tidak menyesatkan. */}
          <Badge variant="outline" className="numeric">
            Ø {formatTon(summary.aggregate.totalKg / Math.max(1, summary.monthly.length))} ton/bulan
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <PeriodChart summary={summary} kind={kind} />
      </CardContent>
    </Card>
  )
}

function DeltaStat({
  label,
  baseline,
  current,
  unit,
  lowerIsBetter = false,
}: {
  label: string
  baseline: number
  current: number
  unit: string
  lowerIsBetter?: boolean
}) {
  const delta = roundTo(current - baseline, 1)
  const improved = lowerIsBetter ? delta < 0 : delta > 0
  // Panah mengikuti ARAH perubahan angka; warna menyatakan baik/buruk.
  // Keduanya dipisah agar penurunan residu tidak tergambar sebagai panah naik.
  const Icon = delta === 0 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight
  const tone =
    delta === 0
      ? 'text-muted-foreground'
      : improved
        ? 'text-emerald-700 dark:text-emerald-300'
        : 'text-red-700 dark:text-red-300'

  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="numeric mt-1 text-xl font-bold">
        {current.toFixed(1)}
        <span className="ml-0.5 text-sm font-medium text-muted-foreground">{unit}</span>
      </p>
      <p className={cn('numeric mt-1 inline-flex items-center gap-1 text-xs font-semibold', tone)}>
        <Icon aria-hidden="true" className="size-3.5" />
        {delta > 0 ? '+' : ''}
        {delta.toFixed(1)} {unit} vs baseline
        <span className="sr-only">
          {improved ? ' — membaik' : delta === 0 ? ' — tidak berubah' : ' — memburuk'}
        </span>
      </p>
    </div>
  )
}

export function PeriodComparison() {
  const [mode, setMode] = useState<ViewMode>('side-by-side')
  const [kind, setKind] = useState<ChartKind>('composition')

  const baseline = PERIOD_SUMMARIES.baseline
  const implementation = PERIOD_SUMMARIES.implementation
  const activeChart = CHART_KINDS.find((item) => item.key === kind) ?? CHART_KINDS[0]

  const modes: readonly { key: ViewMode; label: string }[] = [
    { key: 'side-by-side', label: 'Side-by-Side' },
    { key: 'implementation', label: implementation.shortLabel },
    { key: 'baseline', label: baseline.shortLabel },
  ]

  return (
    <section aria-labelledby="comparison-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="comparison-heading" className="text-lg font-bold tracking-tight">
            Komparasi Periode Program
          </h2>
          <p className="text-sm text-muted-foreground">{activeChart.description}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border p-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="radiogroup"
          aria-label="Mode tampilan komparasi"
          className="flex flex-wrap gap-1 rounded-lg bg-muted p-1"
        >
          {modes.map((item) => (
            <button
              key={item.key}
              type="button"
              role="radio"
              aria-checked={mode === item.key}
              onClick={() => setMode(item.key)}
              className={cn(
                'touch-target rounded-md px-4 text-sm font-semibold transition',
                'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                mode === item.key
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          role="radiogroup"
          aria-label="Jenis grafik yang dibandingkan"
          className="flex flex-wrap gap-1 rounded-lg bg-muted p-1"
        >
          {CHART_KINDS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="radio"
              aria-checked={kind === item.key}
              onClick={() => setKind(item.key)}
              className={cn(
                'touch-target rounded-md px-3 text-xs font-semibold transition',
                'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                kind === item.key
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'side-by-side' ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <PeriodPanel summary={baseline} kind={kind} />
            <PeriodPanel summary={implementation} kind={kind} highlight />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DeltaStat
              label="Rasio residu ke TPA"
              baseline={baseline.aggregate.residuePercent}
              current={implementation.aggregate.residuePercent}
              unit="%"
              lowerIsBetter
            />
            <DeltaStat
              label="Recovery rate"
              baseline={baseline.aggregate.recoveryPercent}
              current={implementation.aggregate.recoveryPercent}
              unit="%"
            />
            <DeltaStat
              label="Porsi organik terpilah"
              baseline={baseline.aggregate.organicPercent}
              current={implementation.aggregate.organicPercent}
              unit="%"
            />
            <DeltaStat
              label="Porsi anorganik dialihkan"
              baseline={baseline.aggregate.inorganicPercent}
              current={implementation.aggregate.inorganicPercent}
              unit="%"
            />
          </div>
        </>
      ) : (
        <PeriodPanel
          summary={mode === 'baseline' ? baseline : implementation}
          kind={kind}
          highlight={mode === 'implementation'}
        />
      )}
    </section>
  )
}
