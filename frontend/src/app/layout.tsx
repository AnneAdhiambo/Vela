import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vela - Transform Your New Tab Into a Productivity Hub',
  description: 'A beautiful Chrome extension that replaces your new tab with a focus timer, task manager, and productivity dashboard. Boost your focus with Pomodoro sessions, track your progress, and stay motivated.',
  keywords: 'productivity, chrome extension, pomodoro timer, task manager, focus, new tab, time tracking',
  authors: [{ name: 'Vela Team' }],
  openGraph: {
    title: 'Vela - Transform Your New Tab Into a Productivity Hub',
    description: 'A beautiful Chrome extension that replaces your new tab with a focus timer, task manager, and productivity dashboard.',
    url: 'https://vela-app.com',
    siteName: 'Vela',
    images: [
      {
        url: '/Vela-demo-screenshot.jpg',
        width: 1200,
        height: 800,
        alt: 'Vela Chrome Extension - Focus Timer and Task Manager Interface',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vela - Transform Your New Tab Into a Productivity Hub',
    description: 'A beautiful Chrome extension that replaces your new tab with a focus timer, task manager, and productivity dashboard.',
    images: ['/Vela-demo-screenshot.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon16.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icon48.png" />
        <link rel="icon" type="image/png" sizes="128x128" href="/icon128.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}