/**
 * Indikator status yang patuh WCAG 2.1 AA (1.4.1 Use of Color):
 * warna SELALU disandingkan dengan ikon dan label teks, sehingga status tetap
 * terbaca oleh pengguna dengan defisiensi penglihatan warna maupun screen reader.
 */

import { AlertTriangle, CheckCircle2, OctagonAlert, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  BALANCE_TOKENS,
  COMPLIANCE_TOKENS,
} from '@/lib/design-tokens'
import {
  DLH_RESIDUE_LIMIT_PERCENT,
  MASS_BALANCE_TOLERANCE_PERCENT,
  formatPercent,
  type BalanceStatus,
  type ComplianceLevel,
} from '@/lib/mass-balance'

const BASE_PILL =
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none'

export function ComplianceIndicator({
  level,
  residuePercent,
  showValue = true,
  className,
}: {
  level: ComplianceLevel
  residuePercent: number
  showValue?: boolean
  className?: string
}) {
  const token = COMPLIANCE_TOKENS[level]
  const Icon = level === 'SAFE' ? CheckCircle2 : level === 'WARNING' ? AlertTriangle : OctagonAlert

  return (
    <span
      className={cn(BASE_PILL, token.badge, className)}
      title={`Rasio residu ${formatPercent(residuePercent)} — batas DLH Kota Bontang ${formatPercent(DLH_RESIDUE_LIMIT_PERCENT)}`}
    >
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      <span>{token.label}</span>
      {showValue ? <span className="numeric font-bold">{formatPercent(residuePercent)}</span> : null}
      <span className="sr-only">
        {`Status kepatuhan DLH Kota Bontang: ${token.label}. Rasio residu ke TPA ${formatPercent(residuePercent)} dari batas maksimum ${formatPercent(DLH_RESIDUE_LIMIT_PERCENT)}.`}
      </span>
    </span>
  )
}

export function BalanceIndicator({
  status,
  deltaPercent,
  className,
}: {
  status: BalanceStatus
  deltaPercent: number
  className?: string
}) {
  const token = BALANCE_TOKENS[status]
  const Icon = status === 'BALANCED' ? CheckCircle2 : ShieldAlert

  return (
    <span
      className={cn(BASE_PILL, token.badge, className)}
      title={`Selisih neraca massa ${deltaPercent.toFixed(2)}% (toleransi ${MASS_BALANCE_TOLERANCE_PERCENT.toFixed(1)}%)`}
    >
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      <span>{token.label}</span>
      <span className="numeric font-bold">{`Δ ${deltaPercent.toFixed(2)}%`}</span>
      <span className="sr-only">
        {status === 'BALANCED'
          ? `Neraca massa seimbang. Selisih ${deltaPercent.toFixed(2)} persen, masih di dalam toleransi ${MASS_BALANCE_TOLERANCE_PERCENT.toFixed(1)} persen.`
          : `Neraca massa tidak seimbang. Selisih ${deltaPercent.toFixed(2)} persen melampaui toleransi ${MASS_BALANCE_TOLERANCE_PERCENT.toFixed(1)} persen.`}
      </span>
    </span>
  )
}
