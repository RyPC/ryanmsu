import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: "Ryan Su's Engineering Trail",
  description:
    'Software Engineer building scalable systems and tech for social good. Explore my journey as a hiking trail.',
  openGraph: {
    title: "Ryan Su's Engineering Trail",
    description:
      'Software Engineer building scalable systems and tech for social good. Explore my journey as a hiking trail.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
