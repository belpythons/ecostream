/**
 * EcoStream Enterprise — Domain core: neraca massa (mass balance) Zone 3.
 *
 * Seluruh kalkulasi kepatuhan DLH Kota Bontang berasal dari modul ini.
 * Tidak ada komponen UI yang boleh menghitung ulang rasio secara manual —
 * semua angka pada dashboard turun dari `computeMassBalance`.
 *
 * Satuan internal: KILOGRAM (integer-friendly). Konversi ke ton hanya di layer
 * presentasi melalui `kgToTon`.
 */

// ---------------------------------------------------------------------------
// Konstanta regulasi
// ---------------------------------------------------------------------------

/** Ambang komitmen DLH Kota Bontang: residu ke TPA Bontang Lestari maks 30.0%. */
export const DLH_RESIDUE_LIMIT_PERCENT = 30.0

/** Ambang peringatan dini (KR 1.2) sebelum menyentuh batas DLH. */
export const DLH_RESIDUE_WARNING_PERCENT = 25.0

/** Toleransi selisih neraca massa: <= 2% dari total timbulan. */
export const MASS_BALANCE_TOLERANCE_PERCENT = 2.0

/** Target recovery / diversion rate korporat (OKR Objective 2). */
export const RECOVERY_TARGET_PERCENT = 85.0

/**
 * Epsilon untuk meredam galat floating point IEEE-754.
 * Contoh kasus nyata: 12.4 + 4.2 + 0 + 1.4 === 18.000000000000004.
 * Seluruh perbandingan ambang batas dibulatkan lebih dulu ke `PRECISION`.
 */
const PRECISION = 3

// ---------------------------------------------------------------------------
// Tipe domain
// ---------------------------------------------------------------------------

/** 7 kategori material anorganik sesuai Database Pengelolaan Sampah Nursery. */
export const INORGANIC_CATEGORIES = [
  'Kardus',
  'Botol',
  'Duplek',
  'Kertas',
  'Thinwall',
  'Piring Telur',
  'Plastik',
] as const

export type InorganicCategory = (typeof INORGANIC_CATEGORIES)[number]

/** Aliran pemanfaatan material anorganik. */
export type InorganicStream = 'reuse' | 'recycle'

/** Rincian berat (kg) satu kategori anorganik, dipisah Guna Ulang vs Daur Ulang. */
export interface InorganicBreakdown {
  /** Guna Ulang — material dipakai kembali tanpa proses ulang. */
  readonly reuseKg: number
  /** Daur Ulang — material diolah kembali oleh Mitra Binaan CSR. */
  readonly recycleKg: number
}

export type InorganicLedger = Readonly<Record<InorganicCategory, InorganicBreakdown>>

/** Input mentah satu log timbangan harian. */
export interface MassBalanceInput {
  /** Berat total timbulan masuk hasil timbangan jembatan (kg). */
  readonly totalKg: number
  /** Berat organik terpilah menuju Komposter Nursery (kg). */
  readonly organicKg: number
  /** Rincian 7 material anorganik (kg). */
  readonly inorganic: InorganicLedger
  /** Berat limbah B3 terisolasi ke TPS B3 (kg). */
  readonly b3Kg: number
  /**
   * Berat residu ke TPA Bontang Lestari (kg).
   * Bila `undefined`, residu diturunkan sebagai sisa: Total - (O + A + B3).
   * Bila diisi (mis. hasil timbangan truk TPA), nilai tersebut dipakai apa
   * adanya sehingga selisih neraca dapat terdeteksi.
   */
  readonly residueKg?: number
}

export type BalanceStatus = 'BALANCED' | 'DISCREPANCY'

export type ComplianceLevel = 'SAFE' | 'WARNING' | 'DANGER'

export interface MassBalanceResult {
  readonly totalKg: number
  readonly organicKg: number
  readonly inorganicKg: number
  readonly inorganicReuseKg: number
  readonly inorganicRecycleKg: number
  readonly b3Kg: number
  readonly residueKg: number
  /** Jumlah keempat aliran keluar (O + A + B3 + R) setelah pembulatan presisi. */
  readonly accountedKg: number
  /** Δ = |Total − (O + A + B3 + R)| dalam kg. Bertanda positif. */
  readonly deltaKg: number
  /** Δ dinyatakan sebagai persentase terhadap total timbulan. */
  readonly deltaPercent: number
  /** BALANCED bila deltaPercent <= 2.0, selain itu DISCREPANCY. */
  readonly balanceStatus: BalanceStatus
  /** (Residu / Total) × 100. */
  readonly residuePercent: number
  /** ((Organik + Anorganik) / Total) × 100. */
  readonly recoveryPercent: number
  readonly organicPercent: number
  readonly inorganicPercent: number
  readonly b3Percent: number
  /** SAFE <= 25%, WARNING 25.1–30.0%, DANGER > 30.0%. */
  readonly complianceLevel: ComplianceLevel
  /** true bila residuePercent > 30.0 — memicu kewajiban catatan operasional. */
  readonly exceedsDlhLimit: boolean
  /**
   * true bila alokasi terpilah melebihi timbulan masuk (residu turunan negatif).
   * Kondisi ini TIDAK boleh di-clamp diam-diam ke nol: itu menyembunyikan
   * salah entri timbangan.
   */
  readonly isOverAllocated: boolean
  readonly recoveryMeetsTarget: boolean
}

// ---------------------------------------------------------------------------
// Utilitas numerik
// ---------------------------------------------------------------------------

/** Pembulatan deterministik ke n desimal, kebal terhadap galat biner. */
export function roundTo(value: number, decimals: number = PRECISION): number {
  if (!Number.isFinite(value)) return 0
  const factor = 10 ** decimals
  // `Number.EPSILON` menghindari 1.005 -> 1.00 pada representasi biner.
  return Math.round((value + Number.EPSILON * Math.sign(value)) * factor) / factor
}

/** Parse input form yang longgar (string kosong, koma desimal, spasi) ke angka aman. */
export function parseWeight(raw: string | number | null | undefined): number {
  if (typeof raw === 'number') return Number.isFinite(raw) && raw >= 0 ? raw : 0
  if (raw === null || raw === undefined) return 0
  const normalized = raw.trim().replace(',', '.')
  if (normalized === '') return 0
  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

export function kgToTon(kg: number, decimals = 1): number {
  return roundTo(kg / 1000, decimals)
}

export function formatTon(kg: number, decimals = 1): string {
  return kgToTon(kg, decimals).toFixed(decimals)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${roundTo(value, decimals).toFixed(decimals)}%`
}

/** Ledger anorganik kosong — titik awal form entri harian. */
export function emptyInorganicLedger(): InorganicLedger {
  return Object.fromEntries(
    INORGANIC_CATEGORIES.map((category) => [category, { reuseKg: 0, recycleKg: 0 }]),
  ) as InorganicLedger
}

export function sumInorganic(ledger: InorganicLedger): {
  reuseKg: number
  recycleKg: number
  totalKg: number
} {
  let reuseKg = 0
  let recycleKg = 0
  for (const category of INORGANIC_CATEGORIES) {
    // Defensif: payload dari API bisa saja tidak memuat seluruh kategori.
    const entry = ledger[category] ?? { reuseKg: 0, recycleKg: 0 }
    reuseKg += Math.max(0, entry.reuseKg)
    recycleKg += Math.max(0, entry.recycleKg)
  }
  reuseKg = roundTo(reuseKg)
  recycleKg = roundTo(recycleKg)
  return { reuseKg, recycleKg, totalKg: roundTo(reuseKg + recycleKg) }
}

// ---------------------------------------------------------------------------
// Kalkulator utama
// ---------------------------------------------------------------------------

export function classifyCompliance(residuePercent: number): ComplianceLevel {
  const value = roundTo(residuePercent, 1)
  if (value > DLH_RESIDUE_LIMIT_PERCENT) return 'DANGER'
  if (value > DLH_RESIDUE_WARNING_PERCENT) return 'WARNING'
  return 'SAFE'
}

/**
 * Menghitung neraca massa satu log harian.
 *
 * Formula (PRD 3.2):
 *   Total    = Organik + Anorganik + B3 + Residu
 *   Recovery = ((Organik + Anorganik) / Total) × 100
 *   Rasio    = (Residu / Total) × 100
 *   Δ        = |Total − (Organik + Anorganik + B3 + Residu)|;  BALANCED bila Δ% <= 2
 */
export function computeMassBalance(input: MassBalanceInput): MassBalanceResult {
  const totalKg = roundTo(Math.max(0, input.totalKg))
  const organicKg = roundTo(Math.max(0, input.organicKg))
  const b3Kg = roundTo(Math.max(0, input.b3Kg))
  const inorganicSum = sumInorganic(input.inorganic)
  const inorganicKg = inorganicSum.totalKg

  const divertedKg = roundTo(organicKg + inorganicKg + b3Kg)
  const derivedResidueKg = roundTo(totalKg - divertedKg)
  const isOverAllocated = input.residueKg === undefined && derivedResidueKg < 0

  const residueKg =
    input.residueKg === undefined ? derivedResidueKg : roundTo(Math.max(0, input.residueKg))

  const accountedKg = roundTo(organicKg + inorganicKg + b3Kg + residueKg)
  const deltaKg = roundTo(Math.abs(totalKg - accountedKg))
  const deltaPercent = totalKg > 0 ? roundTo((deltaKg / totalKg) * 100, 2) : deltaKg > 0 ? 100 : 0

  const residuePercent = totalKg > 0 ? roundTo((Math.max(0, residueKg) / totalKg) * 100, 1) : 0
  const recoveryPercent =
    totalKg > 0 ? roundTo(((organicKg + inorganicKg) / totalKg) * 100, 1) : 0
  const organicPercent = totalKg > 0 ? roundTo((organicKg / totalKg) * 100, 1) : 0
  const inorganicPercent = totalKg > 0 ? roundTo((inorganicKg / totalKg) * 100, 1) : 0
  const b3Percent = totalKg > 0 ? roundTo((b3Kg / totalKg) * 100, 1) : 0

  const balanceStatus: BalanceStatus =
    deltaPercent <= MASS_BALANCE_TOLERANCE_PERCENT && !isOverAllocated
      ? 'BALANCED'
      : 'DISCREPANCY'

  return {
    totalKg,
    organicKg,
    inorganicKg,
    inorganicReuseKg: inorganicSum.reuseKg,
    inorganicRecycleKg: inorganicSum.recycleKg,
    b3Kg,
    residueKg,
    accountedKg,
    deltaKg,
    deltaPercent,
    balanceStatus,
    residuePercent,
    recoveryPercent,
    organicPercent,
    inorganicPercent,
    b3Percent,
    complianceLevel: classifyCompliance(residuePercent),
    exceedsDlhLimit: roundTo(residuePercent, 1) > DLH_RESIDUE_LIMIT_PERCENT,
    isOverAllocated,
    recoveryMeetsTarget: recoveryPercent >= RECOVERY_TARGET_PERCENT,
  }
}

/** Menjumlahkan beberapa log harian menjadi satu neraca periode. */
export function aggregateMassBalance(inputs: readonly MassBalanceInput[]): MassBalanceResult {
  const ledger = emptyInorganicLedger() as Record<InorganicCategory, InorganicBreakdown>
  let totalKg = 0
  let organicKg = 0
  let b3Kg = 0
  let residueKg = 0

  for (const input of inputs) {
    const result = computeMassBalance(input)
    totalKg += result.totalKg
    organicKg += result.organicKg
    b3Kg += result.b3Kg
    residueKg += Math.max(0, result.residueKg)
    for (const category of INORGANIC_CATEGORIES) {
      const entry = input.inorganic[category] ?? { reuseKg: 0, recycleKg: 0 }
      ledger[category] = {
        reuseKg: roundTo(ledger[category].reuseKg + Math.max(0, entry.reuseKg)),
        recycleKg: roundTo(ledger[category].recycleKg + Math.max(0, entry.recycleKg)),
      }
    }
  }

  return computeMassBalance({
    totalKg: roundTo(totalKg),
    organicKg: roundTo(organicKg),
    inorganic: ledger,
    b3Kg: roundTo(b3Kg),
    residueKg: roundTo(residueKg),
  })
}

// ---------------------------------------------------------------------------
// Guardrail penyimpanan (dipakai form entri harian & server action)
// ---------------------------------------------------------------------------

export interface GuardrailViolation {
  readonly code:
    | 'TOTAL_REQUIRED'
    | 'OVER_ALLOCATED'
    | 'MASS_DISCREPANCY'
    | 'DLH_REASON_REQUIRED'
    | 'B3_MANIFEST_REQUIRED'
  readonly message: string
}

export interface GuardrailContext {
  /** Catatan alasan operasional — wajib bila residu > 30%. */
  readonly operationalReason?: string
  /** Nomor manifest — wajib bila ada limbah B3. */
  readonly b3ManifestNumber?: string
}

/**
 * Validasi blocking sebelum log boleh disimpan.
 * Mengembalikan daftar kosong bila data layak simpan.
 */
export function validateForSubmission(
  result: MassBalanceResult,
  context: GuardrailContext = {},
): readonly GuardrailViolation[] {
  const violations: GuardrailViolation[] = []

  if (result.totalKg <= 0) {
    violations.push({
      code: 'TOTAL_REQUIRED',
      message: 'Berat total timbulan masuk wajib diisi dan lebih besar dari 0 kg.',
    })
  }

  if (result.isOverAllocated) {
    violations.push({
      code: 'OVER_ALLOCATED',
      message:
        'Jumlah organik + anorganik + B3 melebihi berat total timbulan. Periksa kembali hasil timbangan.',
    })
  } else if (result.balanceStatus === 'DISCREPANCY') {
    violations.push({
      code: 'MASS_DISCREPANCY',
      message: `Selisih neraca massa ${result.deltaPercent.toFixed(2)}% melampaui toleransi ${MASS_BALANCE_TOLERANCE_PERCENT.toFixed(1)}%.`,
    })
  }

  if (result.exceedsDlhLimit && (context.operationalReason ?? '').trim().length === 0) {
    violations.push({
      code: 'DLH_REASON_REQUIRED',
      message:
        'Rasio residu melampaui batas DLH Kota Bontang (30%). Catatan alasan operasional wajib diisi sebelum data disimpan.',
    })
  }

  if (result.b3Kg > 0 && (context.b3ManifestNumber ?? '').trim().length === 0) {
    violations.push({
      code: 'B3_MANIFEST_REQUIRED',
      message: 'Limbah B3 tercatat > 0 kg. Nomor manifest B3 wajib diisi.',
    })
  }

  return violations
}

/** Alasan operasional baku ketika ambang DLH terlampaui. */
export const OPERATIONAL_REASONS = [
  'Kondisi hujan / material basah',
  'Kerusakan mesin pencacah kompos',
  'Lonjakan timbulan kegiatan korporat',
  'Material terkontaminasi tidak layak daur ulang',
  'Keterlambatan pengangkutan Mitra Binaan',
  'Lainnya (jelaskan pada catatan)',
] as const

export type OperationalReason = (typeof OPERATIONAL_REASONS)[number]
