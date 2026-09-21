/**
 * Executive KPI Strip — 4 kartu utama.
 * Semua angka diturunkan dari neraca massa; gauge residu memakai skala
 * 0–30% (plafon DLH) agar posisi relatif terhadap batas langsung terbaca.
 */

import { Boxes, Leaf, Recycle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { COMPLIANCE_TOKENS } from '@/lib/design-tokens'
import {
  DLH_RESIDUE_LIMIT_PERCENT,
  RECOVERY_TARGET_PERCENT,
  formatPercent,
  formatTon,
  type MassBalanceResult,
} from '@/lib/mass-balance'
import { ComplianceIndicator } from './status-indicator'

/** Bar meter aksesibel: nilai juga diumumkan lewat atribut ARIA, bukan warna saja. */
function Meter({
  value,
  max,
  label,
  barClass,
}: {
  value: number
  max: number
  label: string
  barClass: string
}) {
  const ratio = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div
      role="meter"
      aria-valuenow={Number(value.toFixed(1))}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className="h-2 w-full overflow-hidden rounded-full bg-muted"
    >
      <div className={cn('h-full rounded-full transition-all', barClass)} style={{ width: `${ratio}%` }} />
    </div>
  )
}

export function KpiStrip({
  balance,
  recoveryDeltaPercentagePoints,
  compostHarvestedKg,
  dustBinSets,
  dustBinActive,
}: {
  balance: MassBalanceResult
  recoveryDeltaPercentagePoints: number
  compostHarvestedKg: number
  dustBinSets: number
  dustBinActive: number
}) {
  const complianceToken = COMPLIANCE_TOKENS[balance.complianceLevel]

  return (
    <section aria-label="Indikator kinerja utama" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardDescription className="font-semibold uppercase tracking-wide">
              Rasio Residu ke TPA
            </CardDescription>
            <Recycle aria-hidden="true" className="size-4 text-muted-foreground" />
          </div>
          <CardTitle className={cn('numeric text-3xl font-bold', complianceToken.text)}>
            {formatPercent(balance.residuePercent)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Meter
            value={balance.residuePercent}
            max={DLH_RESIDUE_LIMIT_PERCENT}
            label={`Rasio residu ${formatPercent(balance.residuePercent)} dari plafon ${formatPercent(DLH_RESIDUE_LIMIT_PERCENT)}`}
            barClass={complianceToken.bar}
          />
          <div className="numeric flex justify-between text-[11px] text-muted-foreground">
            <span>0%</span>
            <span>Plafon DLH {formatPercent(DLH_RESIDUE_LIMIT_PERCENT)}</span>
          </div>
          <ComplianceIndicator
            level={balance.complianceLevel}
            residuePercent={balance.residuePercent}
            showValue={false}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardDescription className="font-semibold uppercase tracking-wide">
              Recovery / Diversion Rate
            </CardDescription>
            <TrendingUp aria-hidden="true" className="size-4 text-muted-foreground" />
          </div>
          <CardTitle className="numeric text-3xl font-bold">
            {formatPercent(balance.recoveryPercent)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Meter
            value={balance.recoveryPercent}
            max={100}
            label={`Recovery rate ${formatPercent(balance.recoveryPercent)} terhadap target ${formatPercent(RECOVERY_TARGET_PERCENT)}`}
            barClass="bg-[var(--stream-organic)]"
          />
          <p className="numeric text-[11px] text-muted-foreground">
            Target OKR ≥ {formatPercent(RECOVERY_TARGET_PERCENT)} ·{' '}
            {recoveryDeltaPercentagePoints >= 0 ? '+' : ''}
            {recoveryDeltaPercentagePoints.toFixed(1)} poin persentase vs baseline
          </p>
          <p
            className={cn(
              'text-xs font-semibold',
              balance.recoveryMeetsTarget
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-amber-700 dark:text-amber-300',
            )}
          >
            {balance.recoveryMeetsTarget ? 'Target terpenuhi' : 'Di bawah target'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardDescription className="font-semibold uppercase tracking-wide">
              Hasil Panen Kompos
            </CardDescription>
            <Leaf aria-hidden="true" className="size-4 text-muted-foreground" />
          </div>
          <CardTitle className="numeric text-3xl font-bold">
            {formatTon(compostHarvestedKg)}
            <span className="ml-1 text-base font-medium text-muted-foreground">ton</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="numeric text-xs text-muted-foreground">
            Dari {formatTon(balance.organicKg)} ton organik masuk komposter Nursery.
          </p>
          <Meter
            value={balance.organicKg > 0 ? (compostHarvestedKg / balance.organicKg) * 100 : 0}
            max={100}
            label="Rendemen kompos terhadap organik masuk"
            barClass="bg-[var(--stream-organic)]"
          />
          <p className="numeric text-[11px] text-muted-foreground">
            Rendemen{' '}
            {formatPercent(
              balance.organicKg > 0 ? (compostHarvestedKg / balance.organicKg) * 100 : 0,
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardDescription className="font-semibold uppercase tracking-wide">
              Distribusi Dust Bin
            </CardDescription>
            <Boxes aria-hidden="true" className="size-4 text-muted-foreground" />
          </div>
          <CardTitle className="numeric text-3xl font-bold">
            {dustBinSets}
            <span className="ml-1 text-base font-medium text-muted-foreground">set</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Set 4 wadah terpilah tersebar di Zone 3.
          </p>
          <Meter
            value={dustBinActive}
            max={dustBinSets}
            label={`${dustBinActive} dari ${dustBinSets} set dust bin aktif`}
            barClass="bg-[var(--stream-inorganic)]"
          />
          <p className="numeric text-[11px] text-muted-foreground">
            {dustBinActive} titik aktif (
            {formatPercent(dustBinSets > 0 ? (dustBinActive / dustBinSets) * 100 : 0)})
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
