/**
 * EcoStream Enterprise — token warna semantik (DESIGN_SYSTEM.md).
 *
 * Satu-satunya sumber warna aliran massa & status kepatuhan. Komponen tidak
 * boleh menuliskan hex secara langsung; Recharts membutuhkan nilai hex literal
 * sehingga token diekspor sebagai konstanta TS sekaligus CSS custom property
 * (lihat `app/globals.css`).
 */

import type { ComplianceLevel } from './mass-balance'

export interface StreamToken {
  readonly key: StreamKey
  readonly label: string
  readonly destination: string
  /** Warna inti, dipakai Recharts dan indikator solid. */
  readonly color: string
  /** Kelas Tailwind untuk kartu/border/teks pada light & dark mode. */
  readonly surface: string
  readonly border: string
  readonly text: string
  readonly dot: string
}

export type StreamKey = 'organic' | 'inorganic' | 'b3' | 'residue'

export const STREAM_TOKENS: Readonly<Record<StreamKey, StreamToken>> = {
  organic: {
    key: 'organic',
    label: 'Organik Terpilah',
    destination: 'Komposter Nursery',
    color: '#16A34A', // emerald-600
    surface: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-300 dark:border-emerald-800',
    text: 'text-emerald-800 dark:text-emerald-200',
    dot: 'bg-emerald-600',
  },
  inorganic: {
    key: 'inorganic',
    label: 'Anorganik Dialihkan',
    destination: 'Mitra Binaan CSR',
    color: '#0D9488', // teal-600
    surface: 'bg-teal-50 dark:bg-teal-950/40',
    border: 'border-teal-300 dark:border-teal-800',
    text: 'text-teal-800 dark:text-teal-200',
    dot: 'bg-teal-600',
  },
  b3: {
    key: 'b3',
    label: 'Limbah B3 Terisolasi',
    destination: 'TPS Limbah B3 Berizin',
    color: '#DC2626', // red-600 (hazard crimson)
    surface: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-300 dark:border-red-900',
    text: 'text-red-800 dark:text-red-200',
    dot: 'bg-red-600',
  },
  residue: {
    key: 'residue',
    label: 'Residu ke TPA',
    destination: 'TPA Bontang Lestari',
    color: '#475569', // slate-600
    surface: 'bg-slate-100 dark:bg-slate-800/60',
    border: 'border-slate-300 dark:border-slate-700',
    text: 'text-slate-800 dark:text-slate-100',
    dot: 'bg-slate-600',
  },
}

export const STREAM_ORDER: readonly StreamKey[] = ['organic', 'inorganic', 'b3', 'residue']

/** Sub-aliran material anorganik. Sky dipakai agar kontras dengan Teal. */
export const INORGANIC_STREAM_COLORS = {
  reuse: '#0284C7', // sky-600 — Guna Ulang
  recycle: '#0D9488', // teal-600 — Daur Ulang
} as const

/** Kompos jadi (output Nursery) — turunan lebih terang dari emerald. */
export const COMPOST_COLOR = '#65A30D' // lime-600

export interface ComplianceToken {
  readonly level: ComplianceLevel
  readonly label: string
  readonly color: string
  readonly badge: string
  readonly surface: string
  readonly text: string
  readonly bar: string
}

export const COMPLIANCE_TOKENS: Readonly<Record<ComplianceLevel, ComplianceToken>> = {
  SAFE: {
    level: 'SAFE',
    label: 'Memenuhi Target DLH',
    color: '#10B981', // green-500
    badge:
      'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200',
    surface: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-800 dark:text-emerald-200',
    bar: 'bg-emerald-600',
  },
  WARNING: {
    level: 'WARNING',
    label: 'Mendekati Batas DLH',
    color: '#F59E0B', // amber-500
    badge:
      'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200',
    surface: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-900 dark:text-amber-200',
    bar: 'bg-amber-500',
  },
  DANGER: {
    level: 'DANGER',
    label: 'Melampaui Batas DLH',
    color: '#EF4444', // rose-500
    badge:
      'border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200',
    surface: 'bg-red-50 dark:bg-red-950/40',
    text: 'text-red-800 dark:text-red-200',
    bar: 'bg-red-500',
  },
}

export const BALANCE_TOKENS = {
  BALANCED: {
    label: 'Seimbang',
    badge:
      'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200',
  },
  DISCREPANCY: {
    label: 'Selisih',
    badge:
      'border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200',
  },
} as const
