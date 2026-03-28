import { Syne, Playfair_Display } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
})

export const metadata = {
  title: 'AccessiCom — Adaptive Communication',
  description: 'Real-time communication for everyone',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${syne.variable} ${playfair.variable}`}>
        <body style={{ fontFamily: 'var(--font-syne)' }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}