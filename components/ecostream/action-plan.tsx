'use client'

/** Action Plan & Environmental Targets — kartu inisiatif strategis Zone 3. */

import { useState } from 'react'
import { CalendarCheck, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ACTION_ITEMS, type ActionItem } from '@/lib/eco-data'

export function ActionPlanBoard() {
  const [items, setItems] = useState<readonly ActionItem[]>(ACTION_ITEMS)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  function addItem() {
    if (title.trim() === '') return
    setItems((current) => [
      ...current,
      {
        id: `AP-${String(current.length + 1).padStart(2, '0')}`,
        title: title.trim(),
        description: description.trim() || 'Belum ada keterangan.',
        progressPercent: 0,
        dueLabel: 'Belum dijadwalkan',
      },
    ])
    setTitle('')
    setDescription('')
    setOpen(false)
  }

  return (
    <Card className="h-full">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-base">Action Plan &amp; Environmental Targets</CardTitle>
        <CardDescription>{items.length} inisiatif aktif untuk Zone 3</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-5">
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <span className="numeric shrink-0 text-sm font-bold">{item.progressPercent}%</span>
              </div>
              <div
                role="meter"
                aria-valuenow={item.progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progres ${item.title}`}
                className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-[var(--stream-organic)]"
                  style={{ width: `${item.progressPercent}%` }}
                />
              </div>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <CalendarCheck aria-hidden="true" className="size-3.5" />
                {item.dueLabel}
              </p>
            </li>
          ))}
        </ul>

        <Button type="button" variant="outline" onClick={() => setOpen(true)} className="touch-target w-full">
          <Plus aria-hidden="true" className="size-4" />
          Tambah Action Item
        </Button>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah action item</DialogTitle>
            <DialogDescription>Buat target lingkungan baru untuk Zone 3.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="action-title" className="text-sm font-medium">
                Judul inisiatif
              </label>
              <input
                id="action-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="mis. Optimasi rute pengangkutan"
                className="touch-target rounded-lg border bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="action-desc" className="text-sm font-medium">
                Keterangan
              </label>
              <textarea
                id="action-desc"
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="rounded-lg border bg-background p-3 text-base focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="touch-target px-4">
              Batal
            </Button>
            <Button type="button" onClick={addItem} disabled={title.trim() === ''} className="touch-target px-4">
              Simpan action item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
