import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Internet Speed Test - Test Your Connection Speed',
  description: 'Test your internet connection speed with our comprehensive speed test tool. Get detailed analytics on download speed, upload speed, ping, and network information.',
  keywords: 'internet speed test, speed test, bandwidth test, connection test, network test, download speed, upload speed, ping test',
  authors: [{ name: 'Speed Test App' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}