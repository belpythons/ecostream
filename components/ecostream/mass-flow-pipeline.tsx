'use client'

/**
 * Hero Process Pipeline — alur "Total Timbulan → Stasiun Pemilahan → 4 Output Stream".
 *
 * Seluruh tonase dan persentase diturunkan dari `MassBalanceResult`; komponen
 * ini tidak pernah menghitung ulang maupun menerima angka hardcoded.
 * Konektor digambar sebagai elemen visual nyata (bukan sekadar tata letak)
 * sehingga hubungan antar node tetap terbaca di desktop maupun tablet.
 */

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Biohazard,
  ChevronRight,
  Leaf,
  PackageCheck,
  Recycle,
  Scale,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { STREAM_ORDER, STREAM_TOKENS, type StreamKey } from '@/lib/design-tokens'
import {
  DLH_RESIDUE_LIMIT_PERCENT,
  formatPercent,
  formatTon,
  type MassBalanceResult,
} from '@/lib/mass-balance'
import { ComplianceIndicator } from './status-indicator'

const STREAM_ICONS: Record<StreamKey, LucideIcon> = {
  organic: Leaf,
  inorganic: Recycle,
  b3: Biohazard,
  residue: Trash2,
}

interface StreamNode {
  readonly key: StreamKey
  readonly weightKg: number
  readonly percent: number
}

function buildNodes(balance: MassBalanceResult): readonly StreamNode[] {
  const byKey: Record<StreamKey, StreamNode> = {
    organic: { key: 'organic', weightKg: balance.organicKg, percent: balance.organicPercent },
    inorganic: {
      key: 'inorganic',
      weightKg: balance.inorganicKg,
      percent: balance.inorganicPercent,
    },
    b3: { key: 'b3', weightKg: balance.b3Kg, percent: balance.b3Percent },
    residue: {
      key: 'residue',
      weightKg: Math.max(0, balance.residueKg),
      percent: balance.residuePercent,
    },
  }
  return STREAM_ORDER.map((key) => byKey[key])
}

/** Konektor vertikal (mobile) / horizontal (desktop) antar tahap pipeline. */
function FlowConnector({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center lg:h-full" aria-hidden="true">
      <div className="flex items-center gap-1 lg:flex-col lg:gap-0">
        <span className="h-px w-8 bg-border lg:h-8 lg:w-px" />
        <ArrowRight className="size-4 rotate-90 text-muted-foreground lg:rotate-0" />
        <span className="h-px w-8 bg-border lg:h-8 lg:w-px" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function MassFlowPipeline({
  balance,
  periodLabel,
  breakdown,
}: {
  balance: MassBalanceResult
  periodLabel: string
  /** Rincian yang muncul pada slide-over saat sebuah node diklik. */
  breakdown: Partial<Record<StreamKey, readonly { label: string; valueKg: number }[]>>
}) {
  const [openStream, setOpenStream] = useState<StreamKey | null>(null)
  const nodes = useMemo(() => buildNodes(balance), [balance])
  const activeToken = openStream ? STREAM_TOKENS[openStream] : null
  const activeNode = nodes.find((node) => node.key === openStream)

  return (
    <section aria-labelledby="pipeline-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="pipeline-heading" className="text-lg font-bold tracking-tight">
            Diagram Neraca Massa Sampah Zone 3
          </h2>
          <p className="text-sm text-muted-foreground">
            Alur massa dari timbulan masuk hingga empat tujuan akhir · {periodLabel}
          </p>
        </div>
        <ComplianceIndicator
          level={balance.complianceLevel}
          residuePercent={balance.residuePercent}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,2.2fr)] lg:items-center">
        {/* Tahap 1 — Timbulan masuk */}
        <Card className="border-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription className="font-semibold uppercase tracking-wide">
                Total Timbulan
              </CardDescription>
              <Scale aria-hidden="true" className="size-4 text-muted-foreground" />
            </div>
            <CardTitle className="numeric text-3xl font-bold">
              {formatTon(balance.totalKg)}
              <span className="ml-1 text-base font-medium text-muted-foreground">ton</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="numeric text-xs text-muted-foreground">
              {balance.totalKg.toLocaleString('id-ID')} kg tercatat timbangan
            </p>
            <Badge variant="outline" className="numeric">
              100% massa masuk
            </Badge>
          </CardContent>
        </Card>

        <FlowConnector label="mengalir ke stasiun pemilahan" />

        {/* Tahap 2 — Stasiun pemilahan */}
        <Card className={cn('border-2', STREAM_TOKENS.inorganic.border, STREAM_TOKENS.inorganic.surface)}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription
                className={cn('font-semibold uppercase tracking-wide', STREAM_TOKENS.inorganic.text)}
              >
                Stasiun Pemilahan
              </CardDescription>
              <PackageCheck aria-hidden="true" className={cn('size-4', STREAM_TOKENS.inorganic.text)} />
            </div>
            <CardTitle className="numeric text-3xl font-bold">
              {formatTon(balance.accountedKg)}
              <span className="ml-1 text-base font-medium text-muted-foreground">ton</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="numeric text-xs text-muted-foreground">
              Terpilah {formatPercent(balance.totalKg > 0 ? (balance.accountedKg / balance.totalKg) * 100 : 0)} dari
              timbulan masuk
            </p>
            {balance.balanceStatus === 'DISCREPANCY' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--compliance-danger)]">
                <AlertTriangle aria-hidden="true" className="size-3.5" />
                Selisih {balance.deltaKg.toLocaleString('id-ID')} kg
              </span>
            ) : (
              <Badge variant="outline" className="numeric">
                Neraca seimbang
              </Badge>
            )}
          </CardContent>
        </Card>

        <FlowConnector label="terbagi menjadi empat aliran keluar" />

        {/* Tahap 3 — 4 output stream */}
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Empat aliran keluar hasil pemilahan">
          {nodes.map((node) => {
            const token = STREAM_TOKENS[node.key]
            const Icon = STREAM_ICONS[node.key]
            const isResidue = node.key === 'residue'
            return (
              <li key={node.key}>
                <button
                  type="button"
                  onClick={() => setOpenStream(node.key)}
                  aria-haspopup="dialog"
                  className={cn(
                    'touch-target flex h-full w-full flex-col gap-2 rounded-xl border-2 p-4 text-left transition',
                    'hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                    token.border,
                    token.surface,
                  )}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className={cn('text-xs font-bold uppercase tracking-wide', token.text)}>
                      {token.label}
                    </span>
                    <Icon aria-hidden="true" className={cn('size-4 shrink-0', token.text)} />
                  </span>
                  <span className="numeric text-2xl font-bold">
                    {formatTon(node.weightKg)}
                    <span className="ml-1 text-xs font-medium text-muted-foreground">ton</span>
                    <span className="ml-2 numeric text-sm font-semibold text-muted-foreground">
                      {formatPercent(node.percent)}
                    </span>
                  </span>
                  <span className="text-[11px] text-muted-foreground">{token.destination}</span>
                  {isResidue ? (
                    <ComplianceIndicator
                      level={balance.complianceLevel}
                      residuePercent={node.percent}
                      showValue={false}
                      className="w-fit"
                    />
                  ) : (
                    <span className="numeric text-[11px] font-semibold text-muted-foreground">
                      {node.weightKg.toLocaleString('id-ID')} kg
                    </span>
                  )}
                  <span className="mt-auto inline-flex items-center gap-1 pt-1 text-[11px] font-semibold text-muted-foreground">
                    <ChevronRight aria-hidden="true" className="size-3" />
                    Lihat rincian aliran
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <Dialog open={openStream !== null} onOpenChange={(open) => !open && setOpenStream(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeToken ? (
                <span className={cn('size-3 rounded-full', activeToken.dot)} aria-hidden="true" />
              ) : null}
              {activeToken?.label ?? 'Rincian aliran'}
            </DialogTitle>
            <DialogDescription>
              {activeToken
                ? `Tujuan akhir: ${activeToken.destination} · ${periodLabel}`
                : null}
            </DialogDescription>
          </DialogHeader>

          {activeNode ? (
            <dl className="grid grid-cols-2 gap-3 rounded-lg border p-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Tonase</dt>
                <dd className="numeric text-lg font-bold">{formatTon(activeNode.weightKg)} ton</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Porsi dari timbulan</dt>
                <dd className="numeric text-lg font-bold">{formatPercent(activeNode.percent)}</dd>
              </div>
            </dl>
          ) : null}

          {openStream === 'residue' ? (
            <p className="rounded-lg border p-3 text-xs text-muted-foreground">
              Ambang komitmen DLH Kota Bontang: maksimal{' '}
              <strong className="numeric">{formatPercent(DLH_RESIDUE_LIMIT_PERCENT)}</strong> dari total
              timbulan. Posisi saat ini {formatPercent(balance.residuePercent)}.
            </p>
          ) : null}

          <ul className="divide-y rounded-lg border text-sm">
            {(openStream ? (breakdown[openStream] ?? []) : []).map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="numeric font-semibold">
                  {item.valueKg.toLocaleString('id-ID')} kg
                </span>
              </li>
            ))}
            {(openStream ? (breakdown[openStream] ?? []) : []).length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-muted-foreground">
                Belum ada rincian tercatat untuk aliran ini pada periode berjalan.
              </li>
            ) : null}
          </ul>
        </DialogContent>
      </Dialog>
    </section>
  )
}
