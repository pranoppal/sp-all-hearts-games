import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'All Hearts Games',
  description: 'Play crossword puzzles, sudoku, wordle, and more! Track your progress and compete on leaderboards.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

