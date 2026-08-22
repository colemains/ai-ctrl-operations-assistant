import './globals.css'

export const metadata = {
  title: 'AI CTRL Operations Assistant',
  description: 'Multi-discipline support intelligence platform',
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