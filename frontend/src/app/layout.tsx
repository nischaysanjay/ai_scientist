import '@/app/globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/lib/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI Scientist - Scientific Validation Edition',
  description: 'Automated research analysis and hypothesis validation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
