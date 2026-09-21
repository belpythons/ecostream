'use client'

/**
 * Modul 2 — Neraca Massa.
 *
 * Setiap baris divalidasi ulang lewat `computeMassBalance`; kolom Recovery,
 * Rasio Residu, dan Balance Status TIDAK pernah dibaca dari data mentah.
 * Dengan begitu selisih timbangan yang salah entri tidak bisa lolos sebagai
 * "Seimbang" hanya karena teks pada sumber datanya berkata demikian.
 */

import { useMemo, useState } from 'react'
import { ArrowUpDown, Download, FileText, Filter, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { DAILY_LOGS, SHIFTS, type DailyLog } from '@/lib/eco-data'
import {
  computeMassBalance,
  formatPercent,
  MASS_BALANCE_TOLERANCE_PERCENT,
  validateForSubmission,
  type MassBalanceResult,
} from '@/lib/mass-balance'
import { BalanceIndicator, ComplianceIndicator } from './status-indicator'

type SortKey = 'date' | 'totalKg' | 'residuePercent'
type SortDirection = 'asc' | 'desc'

interface Row {
  readonly source: DailyLog
  readonly balance: MassBalanceResult
  readonly blocked: boolean
}

function toCsv(rows: readonly Row[]): string {
  const header = [
    'Tanggal',
    'ID Log',
    'Shift',
    'Sektor',
    'Timbulan Masuk (kg)',
    'Organik (kg)',
    'Anorganik (kg)',
    'Guna Ulang (kg)',
    'Daur Ulang (kg)',
    'B3 (kg)',
    'Residu TPA (kg)',
    'Rasio Residu (%)',
    'Recovery Rate (%)',
    'Selisih Neraca (kg)',
    'Selisih Neraca (%)',
    'Status Neraca',
    'Status Kepatuhan DLH',
    'Alasan Operasional',
  ]
  const escape = (value: string | number) => {
    const text = String(value)
    return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  const lines = rows.map(({ source, balance }) =>
    [
      source.date,
      source.id,
      source.shift,
      source.sector,
      balance.totalKg,
      balance.organicKg,
      balance.inorganicKg,
      balance.inorganicReuseKg,
      balance.inorganicRecycleKg,
      balance.b3Kg,
      balance.residueKg,
      balance.residuePercent,
      balance.recoveryPercent,
      balance.deltaKg,
      balance.deltaPercent,
      balance.balanceStatus,
      balance.complianceLevel,
      source.operationalReason ?? '',
    ]
      .map(escape)
      .join(','),
  )
  return [header.join(','), ...lines].join('\n')
}

function downloadCsv(rows: readonly Row[]): void {
  const blob = new Blob([`﻿${toCsv(rows)}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `neraca-massa-zone3-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function MassBalanceTable() {
  const [search, setSearch] = useState('')
  const [shiftFilter, setShiftFilter] = useState<string>('Semua shift')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const rows = useMemo<readonly Row[]>(
    () =>
      DAILY_LOGS.map((source) => {
        const balance = computeMassBalance(source.log)
        const blocked =
          validateForSubmission(balance, {
            operationalReason: source.operationalReason,
            b3ManifestNumber: source.b3ManifestNumber,
          }).length > 0
        return { source, balance, blocked }
      }),
    [],
  )

  const visibleRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    const filtered = rows.filter(({ source }) => {
      const matchesTerm =
        term === '' ||
        `${source.id} ${source.date} ${source.sector} ${source.shift}`.toLowerCase().includes(term)
      const matchesShift = shiftFilter === 'Semua shift' || source.shift === shiftFilter
      return matchesTerm && matchesShift
    })

    const sorted = [...filtered].sort((a, b) => {
      const factor = sortDirection === 'asc' ? 1 : -1
      if (sortKey === 'date') return factor * a.source.isoDate.localeCompare(b.source.isoDate)
      if (sortKey === 'totalKg') return factor * (a.balance.totalKg - b.balance.totalKg)
      return factor * (a.balance.residuePercent - b.balance.residuePercent)
    })
    return sorted
  }, [rows, search, shiftFilter, sortKey, sortDirection])

  const discrepancyCount = rows.filter((row) => row.balance.balanceStatus === 'DISCREPANCY').length
  const exceedanceCount = rows.filter((row) => row.balance.exceedsDlhLimit).length

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  function SortButton({ label, sortBy }: { label: string; sortBy: SortKey }) {
    const active = sortKey === sortBy
    return (
      <button
        type="button"
        onClick={() => toggleSort(sortBy)}
        aria-label={`Urutkan berdasarkan ${label}`}
        aria-sort={active ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
        className={cn(
          'inline-flex items-center gap-1 rounded px-1 py-2 font-bold',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          active ? 'text-foreground' : 'hover:text-foreground',
        )}
      >
        {label}
        <ArrowUpDown aria-hidden="true" className="size-3" />
      </button>
    )
  }

  return (
    <Card>
      <CardHeader className="gap-3 border-b sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-lg">1. Neraca Massa</CardTitle>
          <CardDescription>
            Validasi harian: Timbulan = Organik + Anorganik + B3 + Residu, toleransi{' '}
            {MASS_BALANCE_TOLERANCE_PERCENT.toFixed(1)}%.
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          {discrepancyCount > 0 ? (
            <Badge variant="outline" className="border-[var(--compliance-danger)] text-[var(--compliance-danger)]">
              {discrepancyCount} baris selisih
            </Badge>
          ) : null}
          {exceedanceCount > 0 ? (
            <Badge variant="outline" className="border-[var(--compliance-warning)] text-[var(--compliance-warning)]">
              {exceedanceCount} baris &gt; 30%
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <label htmlFor="table-search" className="sr-only">
                Cari log berdasarkan ID, tanggal, sektor, atau shift
              </label>
              <input
                id="table-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari ID log / sektor"
                className="touch-target w-full rounded-lg border bg-background pl-9 pr-3 text-base focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-64"
              />
            </div>
            <div className="relative">
              <Filter
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <label htmlFor="shift-filter" className="sr-only">
                Filter shift
              </label>
              <select
                id="shift-filter"
                value={shiftFilter}
                onChange={(event) => setShiftFilter(event.target.value)}
                className="touch-target w-full rounded-lg border bg-background pl-9 pr-3 text-base focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-48"
              >
                <option>Semua shift</option>
                {SHIFTS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => downloadCsv(visibleRows)}
              className="touch-target px-4"
            >
              <Download aria-hidden="true" className="size-4" />
              Unduh CSV / Excel
            </Button>
            <Button type="button" variant="outline" className="touch-target px-4">
              <FileText aria-hidden="true" className="size-4" />
              Laporan DLH Bontang (PDF)
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <caption className="sr-only">
              Log timbangan harian Zone 3 beserta status neraca massa dan kepatuhan DLH Kota Bontang.
            </caption>
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2">
                  <SortButton label="Tanggal" sortBy="date" />
                </th>
                <th scope="col" className="px-4 py-2 text-right">
                  <SortButton label="Timbulan (kg)" sortBy="totalKg" />
                </th>
                <th scope="col" className="px-4 py-3 text-right font-bold">
                  Organik (kg)
                </th>
                <th scope="col" className="px-4 py-3 text-right font-bold">
                  Anorganik (kg)
                </th>
                <th scope="col" className="px-4 py-3 text-right font-bold">
                  B3 (kg)
                </th>
                <th scope="col" className="px-4 py-3 text-right font-bold">
                  Residu TPA (kg)
                </th>
                <th scope="col" className="px-4 py-2 text-right">
                  <SortButton label="Rasio residu" sortBy="residuePercent" />
                </th>
                <th scope="col" className="px-4 py-3 text-right font-bold">
                  Recovery
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Status neraca
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Kepatuhan DLH
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visibleRows.map(({ source, balance, blocked }) => (
                <tr
                  key={source.id}
                  className={cn(
                    'hover:bg-muted/40',
                    balance.balanceStatus === 'DISCREPANCY' && 'bg-red-50/60 dark:bg-red-950/30',
                  )}
                >
                  <th scope="row" className="px-4 py-3 text-left font-semibold">
                    {source.date}
                    <span className="numeric mt-0.5 block text-[11px] font-normal text-muted-foreground">
                      {source.id} · {source.shift} · {source.sector}
                    </span>
                  </th>
                  <td className="numeric px-4 py-3 text-right font-semibold">
                    {balance.totalKg.toLocaleString('id-ID')}
                  </td>
                  <td className="numeric px-4 py-3 text-right">
                    {balance.organicKg.toLocaleString('id-ID')}
                  </td>
                  <td className="numeric px-4 py-3 text-right">
                    {balance.inorganicKg.toLocaleString('id-ID')}
                    <span className="block text-[11px] text-muted-foreground">
                      GU {balance.inorganicReuseKg} · DU {balance.inorganicRecycleKg}
                    </span>
                  </td>
                  <td className="numeric px-4 py-3 text-right">
                    {balance.b3Kg.toLocaleString('id-ID')}
                  </td>
                  <td className="numeric px-4 py-3 text-right">
                    {balance.residueKg.toLocaleString('id-ID')}
                  </td>
                  <td className="numeric px-4 py-3 text-right font-semibold">
                    {formatPercent(balance.residuePercent)}
                  </td>
                  <td className="numeric px-4 py-3 text-right font-semibold">
                    {formatPercent(balance.recoveryPercent)}
                  </td>
                  <td className="px-4 py-3">
                    <BalanceIndicator
                      status={balance.balanceStatus}
                      deltaPercent={balance.deltaPercent}
                    />
                    {source.notes ? (
                      <span className="mt-1 block max-w-60 text-[11px] text-muted-foreground">
                        {source.notes}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <ComplianceIndicator
                      level={balance.complianceLevel}
                      residuePercent={balance.residuePercent}
                      showValue={false}
                    />
                    {source.operationalReason ? (
                      <span className="mt-1 block max-w-60 text-[11px] text-muted-foreground">
                        Alasan: {source.operationalReason}
                      </span>
                    ) : blocked ? (
                      <span className="mt-1 block text-[11px] font-semibold text-[var(--compliance-danger)]">
                        Perlu verifikasi Environmental Engineer
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Tidak ada log yang cocok dengan filter saat ini.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">
          Menampilkan {visibleRows.length} dari {rows.length} log harian. Seluruh kolom turunan
          dihitung ulang dari berat timbangan pada saat render.
        </p>
      </CardContent>
    </Card>
  )
}
