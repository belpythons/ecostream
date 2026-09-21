# EcoStream Enterprise

Sistem monitoring pengelolaan sampah & neraca massa **Zone 3 PT Badak NGL**
(Nursery & Residential Facility), menggantikan rekapitulasi manual
`Database Pengelolaan Sampah Nursery.xlsx`.

## Aturan bisnis yang ditegakkan kode

| Aturan | Sumber | Implementasi |
| --- | --- | --- |
| `Total = Organik + Anorganik + B3 + Residu` | PRD 3.2 | `computeMassBalance()` |
| Δ neraca ≤ **2%** → `BALANCED`, > 2% → `DISCREPANCY` | PRD 3.2 | `MASS_BALANCE_TOLERANCE_PERCENT` |
| Residu ke TPA Bontang Lestari maks **30.0%** | Komitmen DLH Kota Bontang | `DLH_RESIDUE_LIMIT_PERCENT` |
| Residu > 30% → alert + **catatan alasan operasional wajib** sebelum simpan | BRD 2.4 | `validateForSubmission()` |
| Peringatan dini pada residu > 25% | OKR KR 1.2 | `classifyCompliance()` |
| Recovery rate = `((Organik + Anorganik) / Total) × 100`, target ≥ 85% | OKR Objective 2 | `computeMassBalance()` |
| 7 kategori anorganik, dipisah Guna Ulang vs Daur Ulang | PRD 3.3 | `INORGANIC_CATEGORIES` |

Semua ambang batas berada di satu tempat (`lib/mass-balance.ts`). Tidak ada
persentase, status, atau label kepatuhan yang di-hardcode di layer UI.

## Arsitektur

```
lib/mass-balance.ts    Domain murni: tipe ketat, formula, guardrail. Tanpa React.
lib/eco-data.ts        Mock data timbangan (kg mentah). Turunan dihitung runtime.
lib/design-tokens.ts   Token warna semantik aliran massa & level kepatuhan.
components/ecostream/  Komponen presentasi; menerima MassBalanceResult, tidak menghitung.
app/globals.css        Token CSS light/dark + utility `touch-target` (44px) & `numeric`.
```

Alasan pemisahan: kalkulasi kepatuhan lingkungan harus dapat diaudit dan diuji
tanpa merender UI, dan harus identik antara dashboard, tabel neraca, dan form
entri harian.

## Aksesibilitas (WCAG 2.1 AA)

- Setiap indikator status menyandingkan **warna + ikon + label teks**
  (`components/ecostream/status-indicator.tsx`), tidak pernah warna saja.
- Seluruh tombol, input, select, dan segmented control memiliki target sentuh
  minimal **44×44 px** untuk operasional tablet di lapangan.
- Token warna memiliki varian gelap terpisah agar rasio kontras tetap terjaga.
- Tema light/dark diterapkan lewat kelas pada `<html>` sebelum paint pertama,
  sehingga varian Tailwind `dark:` dan token CSS selalu sinkron.

## Stack

Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 · Shadcn UI
(Base UI primitives) · Recharts · Lucide React.

## Menjalankan

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm typecheck  # tsc --noEmit
pnpm build
```
