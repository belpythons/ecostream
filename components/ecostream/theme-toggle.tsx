'use client'

import { useCallback, useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type ThemePreference = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'ecostream-theme'

/**
 * Skrip yang dijalankan sebelum hidrasi (lihat `app/layout.tsx`) agar kelas
 * `.light` / `.dark` sudah terpasang pada <html> dan tidak terjadi flash tema.
 * Kelas eksplisit juga membuat varian Tailwind `dark:` konsisten dengan token
 * CSS — keduanya bergantung pada kelas yang sama, bukan pada media query.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var k='${THEME_STORAGE_KEY}';var s=localStorage.getItem(k);var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var d=s==='dark'||((!s||s==='system')&&m);var e=document.documentElement;e.classList.toggle('dark',d);e.classList.toggle('light',!d);}catch(_){}})();`

function applyTheme(preference: ThemePreference): void {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = preference === 'dark' || (preference === 'system' && prefersDark)
  const root = document.documentElement
  root.classList.toggle('dark', isDark)
  root.classList.toggle('light', !isDark)
}

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') setPreference(stored)
  }, [])

  useEffect(() => {
    if (!mounted) return
    applyTheme(preference)
    window.localStorage.setItem(THEME_STORAGE_KEY, preference)

    if (preference !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [preference, mounted])

  const cycle = useCallback(() => {
    setPreference((current) =>
      current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system',
    )
  }, [])

  const Icon = preference === 'light' ? Sun : preference === 'dark' ? Moon : Monitor
  const label =
    preference === 'light'
      ? 'Tema terang'
      : preference === 'dark'
        ? 'Tema gelap'
        : 'Tema mengikuti sistem'

  return (
    <Button
      type="button"
      variant="outline"
      onClick={cycle}
      aria-label={`${label}. Klik untuk mengganti tema.`}
      title={label}
      className="touch-target gap-2 px-3"
    >
      <Icon aria-hidden="true" className="size-4" />
      {/* Label teks tetap ada agar kontrol tidak bergantung pada ikon semata. */}
      <span className="hidden text-xs font-medium sm:inline">
        {mounted ? label : 'Tema'}
      </span>
    </Button>
  )
}
