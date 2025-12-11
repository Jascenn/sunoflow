import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import { Providers } from './providers'
import { PlayerBar } from '@/components/music/player-bar'
import './globals.css'

export const metadata: Metadata = {
  title: 'SunoFlow - AI Music Workbench',
  description: 'Professional AI music generation workbench powered by Suno API',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
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
