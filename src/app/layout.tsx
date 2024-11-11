import type { Metadata } from "next"
import type { Viewport } from 'next'
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { ClientLayout } from "@/components/ClientLayout"

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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}

