'use client'

import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  CircleAlert,
  ClipboardCheck,
  Factory,
  Leaf,
  MapPin,
  PackageCheck,
  Recycle,
  ShieldCheck,
  Truck,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const destinations = [
  { label: 'Organik Terpilah', value: '12.4', percent: '68.9%', detail: 'Nursery Composting', icon: Leaf, color: 'green' },
  { label: 'Anorganik Dialihkan dari TPA', value: '4.2', percent: '23.3%', detail: 'Reuse & Recycle • Mitra Binaan', icon: Recycle, color: 'teal' },
  { label: 'Limbah B3', value: '0.0', percent: '0%', detail: 'TPS B3', icon: CircleAlert, color: 'red' },
  { label: 'Residu ke TPA', value: '1.4', percent: '7.8%', detail: 'TPA Bontang Lestari', icon: Truck, color: 'slate' },
]

const monthlyData = [
  { month: 'Jul', total: 16.2, recovery: 90 },
  { month: 'Agu', total: 17.4, recovery: 91 },
  { month: 'Sep', total: 18.0, recovery: 92.2 },
]

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f6f8f7] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#0b5d57] text-white shadow-sm">
              <Factory aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0d9488]">EcoStream Enterprise</p>
              <h1 className="mt-1 max-w-3xl text-sm font-bold tracking-tight text-slate-800 sm:text-base">DASHBOARD MONITORING PENGELOLAAN SAMPAH ZONE 3 - PT BADAK NGL</h1>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500"><MapPin className="size-3.5" /> Nursery &amp; Residential Facility</div>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              <span className="size-2 rounded-full bg-emerald-500" /> Live monitoring
            </div>
            <Select defaultValue="Implementation Start (July 2026 - Present)">
              <SelectTrigger className="w-full bg-white sm:w-[280px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Implementation Start (July 2026 - Present)">Implementation Start (July 2026 - Present)</SelectItem>
                <SelectItem value="Existing Program (January - June 2026)">Existing Program (January - June 2026)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="border-t border-slate-100 bg-[#f0fdf4]">
          <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#166534] lg:px-8"><ShieldCheck className="size-4" /> Komitmen DLH Bontang: Residu TPA Max 30% <Badge className="ml-auto bg-white text-[#15803d] shadow-none">On track</Badge></div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-5 py-7 lg:px-8 lg:py-9">
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0d9488]">Executive overview</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Mass-balance monitoring</h2><p className="mt-1 text-sm text-slate-500">Real-time overview of Zone 3 waste flow and recovery performance.</p></div>
          <div className="text-right"><p className="font-mono text-xs text-slate-400">LAST UPDATED</p><p className="text-sm font-semibold text-slate-700">30 Sep 2026 • 16:42 WIB</p></div>
        </div>

        <section aria-labelledby="flow-heading">
          <div className="mb-4 flex items-center justify-between"><h3 id="flow-heading" className="text-sm font-bold uppercase tracking-wider text-slate-600">Mass-balance flow</h3><Badge variant="outline" className="font-mono text-[10px]">JUL–SEP 2026 YTD</Badge></div>
          <div className="grid gap-4 lg:grid-cols-[1fr_48px_1fr_48px_2.4fr] lg:items-center">
            <Card className="border-slate-200 shadow-sm"><CardHeader className="pb-3"><div className="flex items-center justify-between"><CardDescription>Total Timbulan Sampah</CardDescription><PackageCheck className="size-4 text-[#0d9488]" /></div><CardTitle className="text-3xl font-bold tracking-tight text-slate-900">18.0 <span className="text-base font-medium text-slate-400">ton</span></CardTitle></CardHeader><CardContent><p className="text-xs text-slate-500">1 Jul – 30 Sep 2026</p><div className="mt-4 h-1.5 rounded-full bg-slate-100"><div className="h-full w-full rounded-full bg-[#0d9488]" /></div></CardContent></Card>
            <div className="hidden items-center justify-center lg:flex"><ArrowRight className="size-6 text-[#0d9488]" /></div>
            <Card className="border-[#99d9d3] bg-[#f0fdfa] shadow-sm"><CardHeader className="pb-3"><div className="flex items-center justify-between"><CardDescription className="text-[#0f766e]">Pemilahan</CardDescription><Recycle className="size-4 text-[#0d9488]" /></div><CardTitle className="text-3xl font-bold tracking-tight text-slate-900">18.0 <span className="text-base font-medium text-slate-400">ton</span></CardTitle></CardHeader><CardContent><p className="text-xs text-slate-500">Sorting Hub • 100% terproses</p><div className="mt-4 h-1.5 rounded-full bg-[#ccefeb]"><div className="h-full w-full rounded-full bg-[#0d9488]" /></div></CardContent></Card>
            <div className="hidden items-center justify-center lg:flex"><ArrowRight className="size-6 text-[#0d9488]" /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {destinations.map(({ label, value, percent, detail, icon: Icon, color }) => (
                <Card key={label} className={`shadow-sm ${color === 'green' ? 'border-[#b7e4c0] bg-[#f0fdf4]' : color === 'teal' ? 'border-[#a8ded8] bg-[#f0fdfa]' : color === 'red' ? 'border-[#f5c2c2] bg-[#fff7f7]' : 'border-slate-300 bg-slate-100'}`}>
                  <CardContent className="p-4"><div className="flex items-start justify-between gap-2"><div><p className={`text-xs font-bold ${color === 'green' ? 'text-[#15803d]' : color === 'teal' ? 'text-[#0f766e]' : color === 'red' ? 'text-[#b91c1c]' : 'text-slate-600'}`}>{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value} <span className="text-xs font-medium text-slate-400">ton</span></p></div><Icon className={`size-4 ${color === 'green' ? 'text-[#16a34a]' : color === 'teal' ? 'text-[#0d9488]' : color === 'red' ? 'text-[#dc2626]' : 'text-slate-500'}`} /></div><div className="mt-3 flex items-center justify-between gap-2"><span className="text-[11px] text-slate-500">{detail}</span><span className="font-mono text-[11px] font-bold text-slate-600">{percent}</span></div>{color === 'slate' && <Badge className="mt-3 gap-1 bg-[#dcfce7] text-[10px] text-[#166534] shadow-none"><Check className="size-3" /> Well below 30% target</Badge>}</CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3" aria-label="Performance indicators">
          <Card className="border-slate-200 shadow-sm lg:col-span-2"><CardHeader className="flex flex-row items-center justify-between pb-2"><div><CardTitle className="text-base">Recovery rate</CardTitle><CardDescription>Material recovered from landfill diversion</CardDescription></div><div className="flex items-center gap-1 rounded-full bg-[#dcfce7] px-2.5 py-1 text-xs font-bold text-[#15803d]">↑ 14.5%</div></CardHeader><CardContent><div className="flex items-end gap-3"><p className="text-4xl font-bold tracking-tight text-[#15803d]">92.2<span className="text-xl">%</span></p><p className="mb-1 text-xs text-slate-500">vs baseline</p></div><Progress value={92.2} className="mt-4 h-2 bg-slate-100 [&>div]:bg-[#16a34a]" /><div className="mt-2 flex justify-between text-[11px] text-slate-400"><span>0%</span><span>Target recovery ≥ 70%</span><span>100%</span></div></CardContent></Card>
          <Card className="border-slate-200 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-base">Distribusi Dust Bin</CardTitle><CardDescription>Zone 3 assets installed</CardDescription></CardHeader><CardContent><div className="flex items-center gap-4"><div className="flex size-14 items-center justify-center rounded-2xl bg-[#e0f2f1] text-[#0f766e]"><Users className="size-6" /></div><div><p className="text-4xl font-bold tracking-tight text-slate-900">42 <span className="text-base font-medium text-slate-400">set</span></p><p className="mt-1 text-xs text-[#15803d]">100% titik aktif</p></div></div></CardContent></Card>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Card className="border-slate-200 shadow-sm"><CardHeader className="flex flex-row items-start justify-between"><div><CardTitle className="text-base">Monthly waste overview</CardTitle><CardDescription>Total timbulan and recovery rate</CardDescription></div><BarChart3 className="size-5 text-slate-400" /></CardHeader><CardContent><div className="flex h-52 items-end gap-5 border-b border-l border-slate-200 px-4 pb-0 pt-4 sm:gap-10"><div className="flex h-full flex-1 flex-col justify-between text-[10px] text-slate-400"><span>20 t</span><span>15 t</span><span>10 t</span><span>5 t</span><span>0 t</span></div>{monthlyData.map((item) => <div key={item.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="relative flex h-[86%] w-full max-w-16 items-end rounded-t-md bg-[#d1fae5]"><div className="w-full rounded-t-md bg-[#16a34a]" style={{ height: `${item.total / 20 * 100}%` }} /><span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold text-slate-600">{item.total}t</span></div><span className="pb-3 text-xs font-semibold text-slate-500">{item.month} 26</span></div>)}</div><div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-[#16a34a]" /> Timbulan</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-[#d1fae5]" /> Recovery band</span></div></CardContent></Card>
          <Card className="border-slate-200 shadow-sm"><CardHeader><CardTitle className="text-base">Compliance snapshot</CardTitle><CardDescription>DLH Bontang residue threshold</CardDescription></CardHeader><CardContent><div className="rounded-xl bg-[#f0fdf4] p-4"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-600">Residu ke TPA</span><Badge className="bg-[#dcfce7] text-[#166534] shadow-none">Compliant</Badge></div><div className="mt-3 flex items-baseline gap-2"><span className="text-4xl font-bold text-[#15803d]">7.8%</span><span className="text-sm text-slate-500">of total waste</span></div><Progress value={7.8} className="mt-4 h-2 bg-[#dcfce7] [&>div]:bg-[#16a34a]" /><div className="mt-2 flex justify-between text-[11px] text-slate-500"><span>Current 7.8%</span><span>Max target 30%</span></div></div><div className="mt-5 flex items-start gap-3 border-t border-slate-100 pt-4"><ClipboardCheck className="mt-0.5 size-4 shrink-0 text-[#0d9488]" /><p className="text-xs leading-relaxed text-slate-500">Performance is <span className="font-semibold text-slate-700">22.2 percentage points</span> below the maximum residue commitment.</p></div></CardContent></Card>
        </section>

        <footer className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between"><span>EcoStream Enterprise • PT BADAK NGL • Zone 3</span><span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-500" /> Data synced from operational log</span></footer>
      </div>
    </main>
  )
}
