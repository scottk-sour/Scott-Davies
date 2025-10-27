import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Profit Tools - Business Calculator Suite',
  description: 'Professional business calculators for pricing, profit margins, ROI, and more. One-time payment, lifetime access.',
  keywords: ['business calculator', 'pricing calculator', 'profit margin', 'ROI calculator', 'freelance rate calculator'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
