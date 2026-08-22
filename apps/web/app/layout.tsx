import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI CTRL Operations Assistant',
  description: 'Read-only operational intelligence for AI CTRL support',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}