import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { THEME_BOOTSTRAP_SCRIPT } from '@/components/ecostream/theme-toggle'
import './globals.css'

export const metadata: Metadata = {
  title: 'EcoStream Enterprise | Zone 3 PT Badak NGL',
  description:
    'Dashboard monitoring pengelolaan sampah dan neraca massa Zone 3 PT Badak NGL, termasuk kepatuhan ambang residu 30% DLH Kota Bontang.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/*
          Menetapkan kelas .light / .dark sebelum paint pertama agar tidak ada
          flash tema dan agar varian Tailwind `dark:` konsisten dengan token CSS.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
