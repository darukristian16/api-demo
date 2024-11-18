import type { Metadata } from "next"
import type { Viewport } from 'next'
import "./globals.css"
import { ClientLayout } from "@/components/ClientLayout"
import { Providers } from "@/components/Providers"

export const metadata: Metadata = {
  title: "Telkom AI API Showcase",
  description: "Explore Telkom Indonesia's AI-driven APIs and innovative solutions by the Telkom AI DAG Team",
  keywords: "Telkom, AI, API, Machine Learning, Innovation",
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  )
}
