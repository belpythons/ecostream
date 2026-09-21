/**
 * EcoStream Enterprise — dataset mock realistis Zone 3 PT Badak NGL.
 *
 * PENTING: file ini hanya menyimpan angka TIMBANGAN MENTAH (kg). Seluruh
 * persentase, rasio recovery, status neraca, dan level kepatuhan diturunkan
 * saat runtime oleh `lib/mass-balance.ts`. Tidak ada persentase yang di-hardcode.
 *
 * Skala acuan periode berjalan (September 2026):
 *   Total 18.0 ton · Organik 12.4 ton · Anorganik 4.2 ton · B3 0.0 ton · Residu 1.4 ton
 */

import {
  aggregateMassBalance,
  computeMassBalance,
  emptyInorganicLedger,
  INORGANIC_CATEGORIES,
  type InorganicCategory,
  type InorganicLedger,
  type MassBalanceInput,
  type MassBalanceResult,
} from './mass-balance'

/** [reuseKg, recycleKg] per kategori, urut sesuai `INORGANIC_CATEGORIES`. */
type LedgerTuples = readonly (readonly [number, number])[]

function ledgerOf(pairs: Partial<Record<InorganicCategory, readonly [number, number]>>): InorganicLedger {
  const ledger = emptyInorganicLedger() as Record<InorganicCategory, { reuseKg: number; recycleKg: number }>
  for (const category of INORGANIC_CATEGORIES) {
    const pair = pairs[category]
    if (pair) ledger[category] = { reuseKg: pair[0], recycleKg: pair[1] }
  }
  return ledger
}

function ledgerFromTuples(tuples: LedgerTuples): InorganicLedger {
  return ledgerOf(
    Object.fromEntries(
      INORGANIC_CATEGORIES.map((category, index) => [category, tuples[index] ?? ([0, 0] as const)]),
    ) as Partial<Record<InorganicCategory, readonly [number, number]>>,
  )
}

// Urutan tuple: Kardus, Botol, Duplek, Kertas, Thinwall, Piring Telur, Plastik

export type PeriodKey = 'implementation' | 'baseline'

export interface MonthlyEntry {
  readonly month: string
  readonly log: MassBalanceInput
  /** Kompos matang yang dipanen Nursery pada bulan tersebut (kg). */
  readonly compostHarvestedKg: number
}

export interface PeriodDataset {
  readonly key: PeriodKey
  readonly label: string
  readonly shortLabel: string
  readonly rangeLabel: string
  readonly months: readonly MonthlyEntry[]
}

// ---------------------------------------------------------------------------
// Baseline — Existing Program, Januari–Juni 2026 (pra-implementasi EcoStream)
// ---------------------------------------------------------------------------

const BASELINE_MONTHS: readonly MonthlyEntry[] = [
  {
    month: 'Jan',
    compostHarvestedKg: 1800,
    log: {
      totalKg: 14000,
      organicKg: 7300,
      b3Kg: 40,
      residueKg: 4130,
      inorganic: ledgerFromTuples([
        [70, 380],
        [60, 240],
        [30, 120],
        [40, 300],
        [30, 170],
        [80, 240],
        [150, 620],
      ]),
    },
  },
  {
    month: 'Feb',
    compostHarvestedKg: 2000,
    log: {
      totalKg: 14500,
      organicKg: 7700,
      b3Kg: 35,
      residueKg: 4089,
      inorganic: ledgerFromTuples([
        [73, 408],
        [63, 252],
        [32, 126],
        [42, 318],
        [32, 180],
        [85, 255],
        [160, 650],
      ]),
    },
  },
  {
    month: 'Mar',
    compostHarvestedKg: 2100,
    log: {
      totalKg: 15000,
      organicKg: 8100,
      b3Kg: 30,
      residueKg: 4020,
      inorganic: ledgerFromTuples([
        [78, 426],
        [68, 270],
        [35, 135],
        [48, 340],
        [35, 195],
        [90, 270],
        [170, 690],
      ]),
    },
  },
  {
    month: 'Apr',
    compostHarvestedKg: 2400,
    log: {
      totalKg: 15200,
      organicKg: 8400,
      b3Kg: 30,
      residueKg: 3861,
      inorganic: ledgerFromTuples([
        [80, 430],
        [70, 276],
        [36, 138],
        [49, 347],
        [36, 199],
        [92, 276],
        [175, 705],
      ]),
    },
  },
  {
    month: 'Mei',
    compostHarvestedKg: 2800,
    log: {
      totalKg: 15600,
      organicKg: 8800,
      b3Kg: 25,
      residueKg: 3760,
      inorganic: ledgerFromTuples([
        [83, 444],
        [73, 286],
        [38, 143],
        [51, 360],
        [38, 206],
        [95, 286],
        [182, 730],
      ]),
    },
  },
  {
    month: 'Jun',
    compostHarvestedKg: 3000,
    log: {
      totalKg: 16000,
      organicKg: 9200,
      b3Kg: 25,
      residueKg: 3616,
      inorganic: ledgerFromTuples([
        [87, 465],
        [76, 300],
        [40, 150],
        [53, 377],
        [40, 216],
        [100, 300],
        [190, 765],
      ]),
    },
  },
]

// ---------------------------------------------------------------------------
// Implementation Start — Juli 2026 s.d. sekarang
// ---------------------------------------------------------------------------

const IMPLEMENTATION_MONTHS: readonly MonthlyEntry[] = [
  {
    month: 'Jul',
    compostHarvestedKg: 4400,
    log: {
      totalKg: 16200,
      organicKg: 11000,
      b3Kg: 60,
      residueKg: 1440,
      inorganic: ledgerFromTuples([
        [85, 365],
        [85, 350],
        [85, 180],
        [85, 440],
        [85, 265],
        [175, 360],
        [350, 790],
      ]),
    },
  },
  {
    month: 'Agu',
    compostHarvestedKg: 5000,
    log: {
      totalKg: 17400,
      organicKg: 11900,
      b3Kg: 40,
      residueKg: 1430,
      inorganic: ledgerFromTuples([
        [95, 385],
        [95, 385],
        [95, 195],
        [95, 480],
        [95, 290],
        [190, 390],
        [380, 860],
      ]),
    },
  },
  {
    month: 'Sep',
    compostHarvestedKg: 5400,
    log: {
      // Angka acuan proyek: 18.0 t total · 12.4 t organik · 4.2 t anorganik
      //                      0.0 t B3 · 1.4 t residu
      totalKg: 18000,
      organicKg: 12400,
      b3Kg: 0,
      residueKg: 1400,
      inorganic: ledgerFromTuples([
        [100, 400],
        [100, 400],
        [100, 200],
        [100, 500],
        [100, 300],
        [200, 400],
        [400, 900],
      ]),
    },
  },
]

export const PERIODS: Readonly<Record<PeriodKey, PeriodDataset>> = {
  baseline: {
    key: 'baseline',
    label: 'Baseline — Existing Program (Jan – Jun 2026)',
    shortLabel: 'Baseline',
    rangeLabel: 'Jan – Jun 2026',
    months: BASELINE_MONTHS,
  },
  implementation: {
    key: 'implementation',
    label: 'Implementation Start (Jul 2026 – Sekarang)',
    shortLabel: 'Implementation',
    rangeLabel: 'Jul – Sep 2026',
    months: IMPLEMENTATION_MONTHS,
  },
}

export const PERIOD_ORDER: readonly PeriodKey[] = ['baseline', 'implementation']

// ---------------------------------------------------------------------------
// Turunan periode (semua dihitung, tidak ada angka hardcoded)
// ---------------------------------------------------------------------------

export interface MonthlyPoint {
  readonly month: string
  readonly totalKg: number
  readonly organicKg: number
  readonly compostKg: number
  readonly residueKg: number
  readonly residuePercent: number
  readonly recoveryPercent: number
}

export interface MaterialPoint {
  readonly material: InorganicCategory
  readonly reuseKg: number
  readonly recycleKg: number
  readonly totalKg: number
}

export interface PeriodSummary {
  readonly key: PeriodKey
  readonly label: string
  readonly shortLabel: string
  readonly rangeLabel: string
  /** Log bulanan mentah — dipakai untuk rincian slide-over pipeline. */
  readonly months: readonly MonthlyEntry[]
  /** Neraca agregat seluruh bulan pada periode. */
  readonly aggregate: MassBalanceResult
  /** Neraca bulan terakhir (periode berjalan). */
  readonly latestMonth: MassBalanceResult
  readonly latestMonthLabel: string
  readonly monthly: readonly MonthlyPoint[]
  readonly materials: readonly MaterialPoint[]
  readonly compostHarvestedKg: number
}

function summarizePeriod(dataset: PeriodDataset): PeriodSummary {
  const aggregate = aggregateMassBalance(dataset.months.map((entry) => entry.log))
  const monthly: MonthlyPoint[] = dataset.months.map((entry) => {
    const result = computeMassBalance(entry.log)
    return {
      month: entry.month,
      totalKg: result.totalKg,
      organicKg: result.organicKg,
      compostKg: entry.compostHarvestedKg,
      residueKg: result.residueKg,
      residuePercent: result.residuePercent,
      recoveryPercent: result.recoveryPercent,
    }
  })

  const materials: MaterialPoint[] = INORGANIC_CATEGORIES.map((material) => {
    let reuseKg = 0
    let recycleKg = 0
    for (const entry of dataset.months) {
      reuseKg += entry.log.inorganic[material].reuseKg
      recycleKg += entry.log.inorganic[material].recycleKg
    }
    return { material, reuseKg, recycleKg, totalKg: reuseKg + recycleKg }
  })

  const lastEntry = dataset.months[dataset.months.length - 1]

  return {
    key: dataset.key,
    label: dataset.label,
    shortLabel: dataset.shortLabel,
    rangeLabel: dataset.rangeLabel,
    months: dataset.months,
    aggregate,
    latestMonth: computeMassBalance(lastEntry.log),
    latestMonthLabel: lastEntry.month,
    monthly,
    materials,
    compostHarvestedKg: dataset.months.reduce((sum, entry) => sum + entry.compostHarvestedKg, 0),
  }
}

export const PERIOD_SUMMARIES: Readonly<Record<PeriodKey, PeriodSummary>> = {
  baseline: summarizePeriod(PERIODS.baseline),
  implementation: summarizePeriod(PERIODS.implementation),
}

/** Neraca bulan berjalan — sumber angka Hero Pipeline (18.0 ton September 2026). */
export const CURRENT_MONTH = PERIOD_SUMMARIES.implementation.latestMonth
export const CURRENT_MONTH_LABEL = 'September 2026'

// ---------------------------------------------------------------------------
// Log timbangan harian (Neraca Massa sheet)
// ---------------------------------------------------------------------------

export interface DailyLog {
  readonly id: string
  readonly date: string
  readonly isoDate: string
  readonly shift: 'Shift 1' | 'Shift 2' | 'Shift 3'
  readonly sector: string
  readonly log: MassBalanceInput
  readonly b3ManifestNumber?: string
  readonly operationalReason?: string
  readonly notes?: string
}

/**
 * Sampel log akhir September 2026. Sengaja memuat satu baris DISCREPANCY
 * (27 Sep, selisih timbangan 12 kg) dan satu baris pelampauan ambang DLH
 * (25 Sep, hujan deras) agar logika status terverifikasi pada data nyata.
 */
export const DAILY_LOGS: readonly DailyLog[] = [
  {
    id: 'Z3-0930',
    date: '30 Sep 2026',
    isoDate: '2026-09-30',
    shift: 'Shift 1',
    sector: 'Zone 3 Residential',
    log: {
      totalKg: 640,
      organicKg: 442,
      b3Kg: 0,
      residueKg: 48,
      inorganic: ledgerFromTuples([
        [4, 14],
        [4, 14],
        [3, 7],
        [3, 18],
        [3, 11],
        [7, 14],
        [14, 34],
      ]),
    },
  },
  {
    id: 'Z3-0929',
    date: '29 Sep 2026',
    isoDate: '2026-09-29',
    shift: 'Shift 1',
    sector: 'Zone 3 Residential',
    log: {
      totalKg: 612,
      organicKg: 425,
      b3Kg: 0,
      residueKg: 45,
      inorganic: ledgerFromTuples([
        [4, 13],
        [4, 13],
        [3, 7],
        [3, 17],
        [3, 10],
        [6, 13],
        [13, 33],
      ]),
    },
  },
  {
    id: 'Z3-0928',
    date: '28 Sep 2026',
    isoDate: '2026-09-28',
    shift: 'Shift 2',
    sector: 'Nursery',
    log: {
      totalKg: 598,
      organicKg: 411,
      b3Kg: 0,
      residueKg: 46,
      inorganic: ledgerFromTuples([
        [4, 13],
        [4, 13],
        [3, 7],
        [3, 17],
        [3, 10],
        [6, 13],
        [13, 32],
      ]),
    },
  },
  {
    id: 'Z3-0927',
    date: '27 Sep 2026',
    isoDate: '2026-09-27',
    shift: 'Shift 1',
    sector: 'Industrial Area',
    notes: 'Timbangan residu tercatat 33 kg; selisih 12 kg belum terverifikasi.',
    log: {
      totalKg: 574,
      organicKg: 396,
      b3Kg: 0,
      residueKg: 33,
      inorganic: ledgerFromTuples([
        [4, 12],
        [4, 12],
        [3, 6],
        [3, 16],
        [2, 10],
        [6, 12],
        [12, 31],
      ]),
    },
  },
  {
    id: 'Z3-0926',
    date: '26 Sep 2026',
    isoDate: '2026-09-26',
    shift: 'Shift 1',
    sector: 'Zone 3 Residential',
    log: {
      totalKg: 620,
      organicKg: 430,
      b3Kg: 0,
      residueKg: 45,
      inorganic: ledgerFromTuples([
        [4, 14],
        [4, 13],
        [3, 7],
        [3, 17],
        [3, 11],
        [6, 13],
        [13, 34],
      ]),
    },
  },
  {
    id: 'Z3-0925',
    date: '25 Sep 2026',
    isoDate: '2026-09-25',
    shift: 'Shift 2',
    sector: 'Zone 3 Residential',
    b3ManifestNumber: 'B3-2026-0918',
    operationalReason: 'Kondisi hujan / material basah',
    notes: 'Hujan deras sejak dini hari; organik basah tidak layak komposting.',
    log: {
      totalKg: 705,
      organicKg: 300,
      b3Kg: 5,
      residueKg: 280,
      inorganic: ledgerFromTuples([
        [3, 11],
        [3, 11],
        [2, 6],
        [2, 14],
        [2, 9],
        [5, 11],
        [11, 30],
      ]),
    },
  },
]

// ---------------------------------------------------------------------------
// Konteks operasional lain
// ---------------------------------------------------------------------------

export const SECTORS = ['Zone 3 Residential', 'Nursery', 'Industrial Area', 'Perkantoran'] as const
export const SHIFTS = ['Shift 1', 'Shift 2', 'Shift 3'] as const

export const DUST_BIN_SETS = 42
export const DUST_BIN_ACTIVE = 42

export interface ActionItem {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly progressPercent: number
  readonly dueLabel: string
}

export const ACTION_ITEMS: readonly ActionItem[] = [
  {
    id: 'AP-01',
    title: 'Evaluasi Kapasitas & Efisiensi Pengomposan',
    description:
      'Memastikan seluruh organik terserap komposter Nursery sehingga tidak ada organik yang lolos ke residu TPA.',
    progressPercent: 85,
    dueLabel: 'Target tuntas: 31 Okt 2026',
  },
  {
    id: 'AP-02',
    title: 'Kampanye Kesadaran Lingkungan',
    description:
      'Sosialisasi pemilahan di komplek hunian pekerja untuk menekan laju timbulan harian per kapita.',
    progressPercent: 60,
    dueLabel: 'Kampanye berjalan',
  },
  {
    id: 'AP-03',
    title: 'Audit Sampah Berkala',
    description:
      'Evaluasi komposisi bulanan untuk mengidentifikasi material residu dominan di TPA Bontang Lestari.',
    progressPercent: 40,
    dueLabel: 'Audit berikutnya: 25 Sep 2026',
  },
]

export const MODULE_TABS = [
  'Dashboard',
  '1. Neraca Massa',
  '2. Sampah Zone 3',
  '3. Material Anorganik',
  '4. Mitra Binaan CSR',
  '5. Kompos Nursery',
  '6. Limbah B3',
  '7. Aset Dust Bin',
] as const

export type ModuleTab = (typeof MODULE_TABS)[number]

/** Label ringkas kontrak data anorganik, dipakai pada footer dashboard. */
export const INORGANIC_LEDGER_LABEL = `${INORGANIC_CATEGORIES.length} kategori anorganik (Guna Ulang / Daur Ulang)`
