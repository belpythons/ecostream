'use client'

/**
 * Smart Daily Entry Modal — formulir timbangan harian dengan kalkulasi neraca
 * massa live dan guardrail DLH Kota Bontang.
 *
 * Aturan yang ditegakkan di sini (bukan sekadar visual):
 *  1. Residu = Total − (Organik + Anorganik + B3), dihitung ulang setiap keystroke.
 *  2. Rasio residu > 30.0% → banner peringatan + catatan alasan operasional WAJIB
 *     sebelum tombol simpan aktif.
 *  3. Selisih neraca > 2% atau alokasi melebihi timbulan → simpan diblokir.
 *  4. B3 > 0 kg → nomor manifest wajib.
 */

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, OctagonAlert, Save, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { COMPLIANCE_TOKENS, INORGANIC_STREAM_COLORS } from '@/lib/design-tokens'
import { SECTORS, SHIFTS } from '@/lib/eco-data'
import {
  computeMassBalance,
  DLH_RESIDUE_LIMIT_PERCENT,
  emptyInorganicLedger,
  formatPercent,
  INORGANIC_CATEGORIES,
  MASS_BALANCE_TOLERANCE_PERCENT,
  OPERATIONAL_REASONS,
  parseWeight,
  validateForSubmission,
  type InorganicCategory,
  type InorganicLedger,
  type MassBalanceResult,
} from '@/lib/mass-balance'

type InorganicFormState = Record<InorganicCategory, { reuse: string; recycle: string }>

function emptyInorganicForm(): InorganicFormState {
  return Object.fromEntries(
    INORGANIC_CATEGORIES.map((category) => [category, { reuse: '', recycle: '' }]),
  ) as InorganicFormState
}

function toLedger(form: InorganicFormState): InorganicLedger {
  const ledger = emptyInorganicLedger() as Record<
    InorganicCategory,
    { reuseKg: number; recycleKg: number }
  >
  for (const category of INORGANIC_CATEGORIES) {
    ledger[category] = {
      reuseKg: parseWeight(form[category].reuse),
      recycleKg: parseWeight(form[category].recycle),
    }
  }
  return ledger
}

/** Input angka dengan target sentuh 44px untuk operasional tablet di lapangan. */
function WeightField({
  id,
  label,
  value,
  onChange,
  hint,
  required,
  invalid,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  required?: boolean
  invalid?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required ? (
          <span className="ml-1 text-[var(--compliance-danger)]" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        step="0.1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-required={required}
        aria-invalid={invalid ?? false}
        aria-describedby={hint ? `${id}-hint` : undefined}
        placeholder="0"
        className={cn(
          'touch-target numeric w-full rounded-lg border bg-background px-3 text-base',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          invalid && 'border-[var(--compliance-danger)]',
        )}
      />
      {hint ? (
        <p id={`${id}-hint`} className="text-[11px] text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export interface WeighingSubmission {
  readonly date: string
  readonly shift: string
  readonly sector: string
  readonly balance: MassBalanceResult
  readonly operationalReason: string
  readonly operationalNote: string
  readonly b3ManifestNumber: string
}

export function WeighingDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultDate = '2026-09-30',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (submission: WeighingSubmission) => void
  defaultDate?: string
}) {
  const [date, setDate] = useState(defaultDate)
  const [shift, setShift] = useState<string>(SHIFTS[0])
  const [sector, setSector] = useState<string>(SECTORS[0])
  const [total, setTotal] = useState('')
  const [organic, setOrganic] = useState('')
  const [b3, setB3] = useState('')
  const [manifest, setManifest] = useState('')
  const [inorganic, setInorganic] = useState<InorganicFormState>(emptyInorganicForm)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [attempted, setAttempted] = useState(false)

  const balance = useMemo<MassBalanceResult>(
    () =>
      computeMassBalance({
        totalKg: parseWeight(total),
        organicKg: parseWeight(organic),
        b3Kg: parseWeight(b3),
        inorganic: toLedger(inorganic),
        // residueKg sengaja tidak diisi: diturunkan sebagai sisa neraca.
      }),
    [total, organic, b3, inorganic],
  )

  const violations = useMemo(
    () => validateForSubmission(balance, { operationalReason: reason, b3ManifestNumber: manifest }),
    [balance, reason, manifest],
  )

  const canSubmit = violations.length === 0
  const complianceToken = COMPLIANCE_TOKENS[balance.complianceLevel]

  function resetForm() {
    setTotal('')
    setOrganic('')
    setB3('')
    setManifest('')
    setInorganic(emptyInorganicForm())
    setReason('')
    setNote('')
    setAttempted(false)
  }

  function handleSubmit() {
    setAttempted(true)
    if (!canSubmit) return
    onSubmit?.({
      date,
      shift,
      sector,
      balance,
      operationalReason: reason,
      operationalNote: note,
      b3ManifestNumber: manifest,
    })
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Catat Timbangan Harian</DialogTitle>
          <DialogDescription>
            Neraca massa, rasio residu, dan status kepatuhan DLH dihitung otomatis saat Anda mengetik.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Baris 1 — konteks log */}
          <fieldset className="grid gap-3 sm:grid-cols-3">
            <legend className="sr-only">Konteks pencatatan</legend>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="log-date" className="text-sm font-medium">
                Tanggal
              </label>
              <input
                id="log-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="touch-target w-full rounded-lg border bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="log-shift" className="text-sm font-medium">
                Shift kerja
              </label>
              <select
                id="log-shift"
                value={shift}
                onChange={(event) => setShift(event.target.value)}
                className="touch-target w-full rounded-lg border bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {SHIFTS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="log-sector" className="text-sm font-medium">
                Sektor asal
              </label>
              <select
                id="log-sector"
                value={sector}
                onChange={(event) => setSector(event.target.value)}
                className="touch-target w-full rounded-lg border bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {SECTORS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          {/* Baris 2–3 — timbulan & organik */}
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-semibold">Timbangan utama</legend>
            <WeightField
              id="weight-total"
              label="Berat total timbulan masuk (kg)"
              value={total}
              onChange={setTotal}
              required
              invalid={attempted && balance.totalKg <= 0}
              hint="Hasil timbangan jembatan sebelum pemilahan."
            />
            <WeightField
              id="weight-organic"
              label="Berat organik terpilah (kg)"
              value={organic}
              onChange={setOrganic}
              hint="Disalurkan ke Komposter Nursery."
            />
          </fieldset>

          {/* Baris 4 — rincian 7 material anorganik */}
          <fieldset className="rounded-xl border p-4">
            <legend className="px-1 text-sm font-semibold">
              Rincian 7 material anorganik (kg)
            </legend>
            <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: INORGANIC_STREAM_COLORS.reuse }}
                />
                Guna Ulang (reuse)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: INORGANIC_STREAM_COLORS.recycle }}
                />
                Daur Ulang (recycle)
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {INORGANIC_CATEGORIES.map((category) => {
                const slug = category.toLowerCase().replace(/\s+/g, '-')
                return (
                  <div key={category} className="rounded-lg border p-3">
                    <p className="mb-2 text-sm font-semibold">{category}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label htmlFor={`${slug}-reuse`} className="text-[11px] text-muted-foreground">
                          Guna Ulang
                        </label>
                        <input
                          id={`${slug}-reuse`}
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step="0.1"
                          placeholder="0"
                          value={inorganic[category].reuse}
                          onChange={(event) =>
                            setInorganic((current) => ({
                              ...current,
                              [category]: { ...current[category], reuse: event.target.value },
                            }))
                          }
                          className="touch-target numeric w-full rounded-lg border bg-background px-2.5 text-base focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label
                          htmlFor={`${slug}-recycle`}
                          className="text-[11px] text-muted-foreground"
                        >
                          Daur Ulang
                        </label>
                        <input
                          id={`${slug}-recycle`}
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step="0.1"
                          placeholder="0"
                          value={inorganic[category].recycle}
                          onChange={(event) =>
                            setInorganic((current) => ({
                              ...current,
                              [category]: { ...current[category], recycle: event.target.value },
                            }))
                          }
                          className="touch-target numeric w-full rounded-lg border bg-background px-2.5 text-base focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="numeric mt-3 text-sm">
              Subtotal anorganik:{' '}
              <strong>{balance.inorganicKg.toLocaleString('id-ID')} kg</strong>{' '}
              <span className="text-muted-foreground">
                (Guna Ulang {balance.inorganicReuseKg.toLocaleString('id-ID')} kg · Daur Ulang{' '}
                {balance.inorganicRecycleKg.toLocaleString('id-ID')} kg)
              </span>
            </p>
          </fieldset>

          {/* Baris 5 — limbah B3 */}
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-semibold">Limbah B3</legend>
            <WeightField
              id="weight-b3"
              label="Berat limbah B3 (kg)"
              value={b3}
              onChange={setB3}
              hint="Diisolasi ke TPS Limbah B3 berizin."
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="b3-manifest" className="text-sm font-medium">
                Nomor manifest B3
                {balance.b3Kg > 0 ? (
                  <span className="ml-1 text-[var(--compliance-danger)]" aria-hidden="true">
                    *
                  </span>
                ) : null}
              </label>
              <input
                id="b3-manifest"
                value={manifest}
                onChange={(event) => setManifest(event.target.value)}
                placeholder="B3-2026-001"
                aria-required={balance.b3Kg > 0}
                aria-invalid={
                  attempted && violations.some((item) => item.code === 'B3_MANIFEST_REQUIRED')
                }
                className="touch-target w-full rounded-lg border bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
          </fieldset>

          {/* Baris 6 — hasil kalkulasi live */}
          <section aria-live="polite" className="space-y-3 rounded-xl border p-4">
            <h3 className="text-sm font-semibold">Kalkulasi neraca massa otomatis</h3>
            <dl className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border p-3">
                <dt className="text-xs text-muted-foreground">
                  Residu ke TPA = Total − (Organik + Anorganik + B3)
                </dt>
                <dd className="numeric mt-1 text-2xl font-bold">
                  {balance.residueKg.toLocaleString('id-ID')}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">kg</span>
                </dd>
              </div>
              <div className={cn('rounded-lg border p-3', complianceToken.surface)}>
                <dt className="text-xs text-muted-foreground">Rasio residu (Residu / Total)</dt>
                <dd className={cn('numeric mt-1 text-2xl font-bold', complianceToken.text)}>
                  {formatPercent(balance.residuePercent)}
                </dd>
                <p className="numeric mt-1 text-[11px] text-muted-foreground">
                  Batas DLH {formatPercent(DLH_RESIDUE_LIMIT_PERCENT)}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <dt className="text-xs text-muted-foreground">Recovery rate</dt>
                <dd className="numeric mt-1 text-2xl font-bold">
                  {formatPercent(balance.recoveryPercent)}
                </dd>
                <p className="numeric mt-1 text-[11px] text-muted-foreground">
                  Selisih neraca Δ {balance.deltaPercent.toFixed(2)}% (toleransi{' '}
                  {MASS_BALANCE_TOLERANCE_PERCENT.toFixed(1)}%)
                </p>
              </div>
            </dl>

            {balance.balanceStatus === 'BALANCED' && balance.totalKg > 0 ? (
              <p className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
                <CheckCircle2 aria-hidden="true" className="size-4" />
                Neraca massa seimbang — selisih {balance.deltaPercent.toFixed(2)}% di dalam toleransi.
              </p>
            ) : null}
          </section>

          {/* Guardrail DLH — banner + catatan alasan wajib */}
          {balance.exceedsDlhLimit ? (
            <section
              role="alert"
              className="space-y-3 rounded-xl border-2 border-[var(--compliance-danger)] bg-red-50 p-4 dark:bg-red-950/50"
            >
              <p className="flex items-start gap-2 text-sm font-bold text-red-800 dark:text-red-200">
                <OctagonAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
                PERINGATAN: Rasio residu {formatPercent(balance.residuePercent)} melebihi batas
                toleransi komitmen DLH Kota Bontang (maks.{' '}
                {formatPercent(DLH_RESIDUE_LIMIT_PERCENT)}). Catatan alasan operasional wajib diisi
                sebelum data dapat disimpan.
              </p>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="operational-reason" className="text-sm font-semibold">
                  Alasan operasional
                  <span className="ml-1" aria-hidden="true">
                    *
                  </span>
                </label>
                <select
                  id="operational-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  aria-required
                  aria-invalid={
                    attempted && violations.some((item) => item.code === 'DLH_REASON_REQUIRED')
                  }
                  className="touch-target w-full rounded-lg border bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">— Pilih alasan —</option>
                  {OPERATIONAL_REASONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="operational-note" className="text-sm font-semibold">
                  Keterangan tambahan
                </label>
                <textarea
                  id="operational-note"
                  rows={2}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Jelaskan kondisi lapangan yang menyebabkan lonjakan residu."
                  className="w-full rounded-lg border bg-background p-3 text-base focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
            </section>
          ) : balance.complianceLevel === 'WARNING' ? (
            <p
              role="status"
              className="flex items-start gap-2 rounded-xl border-2 border-[var(--compliance-warning)] bg-amber-50 p-4 text-sm font-semibold text-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
            >
              <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              Rasio residu {formatPercent(balance.residuePercent)} sudah mendekati batas DLH Kota
              Bontang. Tinjau kembali efektivitas pemilahan sebelum menembus 30%.
            </p>
          ) : null}

          {/* Daftar hambatan penyimpanan */}
          {attempted && violations.length > 0 ? (
            <ul
              role="alert"
              className="space-y-1.5 rounded-xl border-2 border-[var(--compliance-danger)] bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200"
            >
              {violations.map((violation) => (
                <li key={violation.code} className="flex items-start gap-2">
                  <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  {violation.message}
                </li>
              ))}
            </ul>
          ) : null}

          {!attempted && violations.length > 0 && balance.totalKg > 0 ? (
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              {violations.length} syarat validasi belum terpenuhi.
            </p>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Badge variant="outline" className="numeric h-auto py-1.5">
            {balance.totalKg.toLocaleString('id-ID')} kg masuk ·{' '}
            {balance.accountedKg.toLocaleString('id-ID')} kg teralokasi
          </Badge>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="touch-target px-4"
            >
              <X aria-hidden="true" className="size-4" />
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              aria-disabled={!canSubmit}
              className="touch-target px-4"
            >
              <Save aria-hidden="true" className="size-4" />
              Simpan &amp; Validasi Log
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
