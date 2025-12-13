import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import { Providers } from './providers'
import { PlayerBar } from '@/components/music/player-bar'
import './globals.css'

export const metadata: Metadata = {
  title: 'SunoFlow - AI Music Workbench',
  description: 'Professional AI music generation workbench powered by Suno API',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
    other: [
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <Providers>
            {children}
            <PlayerBar />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                },
              }}
            />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
