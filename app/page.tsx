'use client'

/**
 * EcoStream Enterprise — Executive Dashboard Zone 3 PT Badak NGL.
 *
 * Halaman ini murni komposisi: seluruh angka berasal dari `lib/eco-data.ts`
 * yang diturunkan oleh `lib/mass-balance.ts`. Tidak ada persentase, status,
 * maupun label kepatuhan yang ditulis manual di layer presentasi.
 */

import { useMemo, useState } from 'react'
import { Factory, MapPin, Plus, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ActionPlanBoard } from '@/components/ecostream/action-plan'
import { KpiStrip } from '@/components/ecostream/kpi-strip'
import { MassBalanceTable } from '@/components/ecostream/mass-balance-table'
import { MassFlowPipeline } from '@/components/ecostream/mass-flow-pipeline'
import { PeriodComparison } from '@/components/ecostream/period-comparison'
import { ComplianceIndicator } from '@/components/ecostream/status-indicator'
import { ThemeToggle } from '@/components/ecostream/theme-toggle'
import { WeighingDialog, type WeighingSubmission } from '@/components/ecostream/weighing-dialog'
import { cn } from '@/lib/utils'
import type { StreamKey } from '@/lib/design-tokens'
import {
  CURRENT_MONTH,
  CURRENT_MONTH_LABEL,
  DUST_BIN_ACTIVE,
  DUST_BIN_SETS,
  INORGANIC_LEDGER_LABEL,
  MODULE_TABS,
  PERIOD_SUMMARIES,
  type ModuleTab,
} from '@/lib/eco-data'
import {
  DLH_RESIDUE_LIMIT_PERCENT,
  formatPercent,
  formatTon,
  INORGANIC_CATEGORIES,
  roundTo,
} from '@/lib/mass-balance'

const MODULE_DESCRIPTIONS: Record<ModuleTab, string> = {
  Dashboard: 'Ringkasan eksekutif, alur neraca massa, dan komparasi periode.',
  '1. Neraca Massa': 'Validasi formula harian dan ekspor laporan kepatuhan.',
  '2. Sampah Zone 3': 'Log timbulan per sub-blok hunian, perkantoran, dan Nursery.',
  '3. Material Anorganik': 'Katalog 7 material dengan pemisahan Guna Ulang dan Daur Ulang.',
  '4. Mitra Binaan CSR': 'Log serah terima material ke bank sampah dan off-taker sirkular.',
  '5. Kompos Nursery': 'Siklus batch komposter dari bahan mentah hingga pupuk siap pakai.',
  '6. Limbah B3': 'Registri TPS B3 berizin beserta pelacakan manifest dan masa simpan.',
  '7. Aset Dust Bin': 'Sebaran titik set wadah terpilah di seluruh Zone 3.',
}

export default function Page() {
  const [weighOpen, setWeighOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<ModuleTab>('Dashboard')
  const [savedLog, setSavedLog] = useState<WeighingSubmission | null>(null)

  const implementation = PERIOD_SUMMARIES.implementation
  const baseline = PERIOD_SUMMARIES.baseline
  const balance = CURRENT_MONTH

  const recoveryDelta = roundTo(
    implementation.aggregate.recoveryPercent - baseline.aggregate.recoveryPercent,
    1,
  )

  /** Rincian yang muncul pada slide-over tiap node pipeline. */
  const breakdown = useMemo<
    Partial<Record<StreamKey, readonly { label: string; valueKg: number }[]>>
  >(() => {
    const septemberLedger = implementation.months[implementation.months.length - 1].log.inorganic
    return {
      organic: [
        { label: 'Masuk komposter Nursery', valueKg: balance.organicKg },
        {
          label: 'Kompos matang dipanen',
          valueKg: implementation.monthly[implementation.monthly.length - 1].compostKg,
        },
      ],
      inorganic: INORGANIC_CATEGORIES.map((category) => ({
        label: `${category} (GU ${septemberLedger[category].reuseKg} kg / DU ${septemberLedger[category].recycleKg} kg)`,
        valueKg: septemberLedger[category].reuseKg + septemberLedger[category].recycleKg,
      })),
      b3: [{ label: 'Manifest terbit bulan berjalan', valueKg: balance.b3Kg }],
      residue: [{ label: 'Diangkut ke TPA Bontang Lestari', valueKg: balance.residueKg }],
    }
  }, [balance, implementation])

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ---------------------------------------------------------------- Header */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--stream-inorganic)] text-white"
            >
              <Factory className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--stream-inorganic)]">
                EcoStream Enterprise
              </p>
              <h1 className="text-base font-bold tracking-tight sm:text-lg">
                Dashboard Monitoring Pengelolaan Sampah Zone 3 — PT Badak NGL
              </h1>
              <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin aria-hidden="true" className="size-3.5" />
                Nursery &amp; Residential Facility · Periode {CURRENT_MONTH_LABEL}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <Button type="button" onClick={() => setWeighOpen(true)} className="touch-target px-4">
              <Plus aria-hidden="true" className="size-4" />
              Catat Timbangan
            </Button>
          </div>
        </div>

        <div className="border-t bg-muted/40">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-2 lg:px-8">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
              <ShieldCheck aria-hidden="true" className="size-4 text-[var(--stream-inorganic)]" />
              Komitmen DLH Kota Bontang: residu TPA maks.{' '}
              {formatPercent(DLH_RESIDUE_LIMIT_PERCENT)}
            </span>
            <ComplianceIndicator
              level={balance.complianceLevel}
              residuePercent={balance.residuePercent}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] space-y-8 px-4 py-8 lg:px-8">
        {/* ------------------------------------------------- Navigasi 8 modul */}
        <nav aria-label="Modul EcoStream" className="overflow-x-auto rounded-xl border p-1">
          <ul className="flex min-w-max gap-1">
            {MODULE_TABS.map((tab) => (
              <li key={tab}>
                <button
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  aria-current={activeTab === tab ? 'page' : undefined}
                  className={cn(
                    'touch-target rounded-lg px-4 text-sm font-semibold transition',
                    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                    activeTab === tab
                      ? 'bg-[var(--stream-inorganic)] text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {savedLog ? (
          <p
            role="status"
            className="rounded-xl border-2 border-[var(--stream-organic)] bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
          >
            Log {savedLog.date} ({savedLog.shift} · {savedLog.sector}) tersimpan —{' '}
            {savedLog.balance.totalKg.toLocaleString('id-ID')} kg timbulan, rasio residu{' '}
            {formatPercent(savedLog.balance.residuePercent)}, status{' '}
            {savedLog.balance.balanceStatus === 'BALANCED' ? 'seimbang' : 'selisih'}.
          </p>
        ) : null}

        {activeTab === 'Dashboard' ? (
          <>
            <MassFlowPipeline
              balance={balance}
              periodLabel={CURRENT_MONTH_LABEL}
              breakdown={breakdown}
            />

            <KpiStrip
              balance={balance}
              recoveryDeltaPercentagePoints={recoveryDelta}
              compostHarvestedKg={
                implementation.monthly[implementation.monthly.length - 1].compostKg
              }
              dustBinSets={DUST_BIN_SETS}
              dustBinActive={DUST_BIN_ACTIVE}
            />

            <section className="grid gap-5 lg:grid-cols-[7fr_3fr]" aria-label="Analitik dan rencana aksi">
              <div className="space-y-5">
                <PeriodComparison />
              </div>
              <ActionPlanBoard />
            </section>
          </>
        ) : activeTab === '1. Neraca Massa' ? (
          <MassBalanceTable />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{activeTab}</CardTitle>
              <CardDescription>{MODULE_DESCRIPTIONS[activeTab]}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant="outline">Dijadwalkan pada milestone berikutnya</Badge>
              <p className="text-sm text-muted-foreground">
                Modul ini belum tersedia pada build saat ini. Data sumbernya sudah tersedia melalui
                skema relasional (lihat PRD bagian 3.3) sehingga integrasi dapat dilakukan tanpa
                mengubah kontrak kalkulasi neraca massa.
              </p>
              <p className="numeric text-sm text-muted-foreground">
                Referensi periode berjalan: {formatTon(balance.totalKg)} ton timbulan ·{' '}
                {formatPercent(balance.recoveryPercent)} recovery ·{' '}
                {formatPercent(balance.residuePercent)} residu.
              </p>
            </CardContent>
          </Card>
        )}

        <footer className="flex flex-col gap-2 border-t pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>EcoStream Enterprise · PT Badak NGL · Zone 3 Nursery &amp; Residential</span>
          <span className="numeric">
            {INORGANIC_LEDGER_LABEL} · Toleransi neraca 2.0% · Plafon residu{' '}
            {formatPercent(DLH_RESIDUE_LIMIT_PERCENT)}
          </span>
        </footer>
      </div>

      <WeighingDialog open={weighOpen} onOpenChange={setWeighOpen} onSubmit={setSavedLog} />
    </main>
  )
}
