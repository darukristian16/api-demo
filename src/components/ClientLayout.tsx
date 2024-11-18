'use client'

import { BackgroundBeams } from "@/components/ui/background-beams"
import { usePathname } from 'next/navigation'
import { NavBar } from './NavBar'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isApiPage = pathname.startsWith('/api')

  return (
    <div className="relative min-h-screen">
      <NavBar />
      {children}
      {!isApiPage && <BackgroundBeams />}
    </div>
  )
}
