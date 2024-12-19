'use client'

import { useSession, signOut } from 'next-auth/react'
import { cn } from "@/lib/utils"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { HomeIcon, Sun, Moon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Switch } from "@/components/ui/switch"
import { useTheme } from 'next-themes'

export function NavBar() {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  // Wait until mounted to show theme toggle
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  if (pathname === '/login') return null
  
  // Don't render theme toggle until mounted
  if (!mounted) return null

  return (
    <div className="fixed top-4 inset-x-0 max-w-2xl mx-auto z-50">
      <div className={cn(
        "relative flex items-center justify-between px-4 py-2",
        "rounded-full border bg-white/60 dark:bg-zinc-900/60 border-zinc-500 dark:border-zinc-500",
        "backdrop-blur-md"
      )}>
        <div className="flex items-center gap-4">
          <Link 
            href="/"
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <HomeIcon className="w-5 h-5 text-gray-900 dark:text-white" />
          </Link>
          <h1 className="text-zinc-950 dark:text-white text-lg font-bold font-sans">Telkom AI API</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="theme-toggle"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeToggle}
            />
            {theme === 'dark' ? (
              <Moon className="h-4 w-4 text-white" />
            ) : (
              <Sun className="h-4 w-4 text-black" />
            )}
          </div>

          {session && (
            <div className="flex items-center gap-4">
              <span className="dark:text-white text-zinc-950 text-sm font-bold">
                {session.user?.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="px-3 py-1.5 text-sm rounded-full bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-200 dark:hover:bg-zinc-400 text-zinc-950 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
