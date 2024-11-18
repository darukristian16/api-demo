'use client'

import { useSession, signOut } from 'next-auth/react'
import { motion, useAnimation } from "framer-motion"
import { cn } from "@/lib/utils"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { HomeIcon, ChevronUp } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function NavBar() {
  const { data: session } = useSession()
  const controls = useAnimation()
  const arrowControls = useAnimation()
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/login') return

    const handleMouseMove = (event: MouseEvent) => {
      if (event.clientY <= 60) {
        setIsVisible(true)
        controls.start({ y: 0, opacity: 1 })
        arrowControls.start({ opacity: 0 })
      } else {
        setIsVisible(false)
        controls.start({ y: -100, opacity: 0 })
        arrowControls.start({ opacity: 1 })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [controls, arrowControls, pathname])

  if (pathname === '/login') return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={arrowControls}
        className="fixed top-2 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="flex flex-col items-center gap-1">
          <ChevronUp className="w-6 h-6 text-white animate-bounce" />
          <span className="text-xs text-white/70">Menu</span>
        </div>
      </motion.div>

      <div className="fixed top-4 inset-x-0 max-w-2xl mx-auto z-50">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={controls}
          transition={{ duration: 0.3 }}
          className={cn(
            "relative flex items-center justify-between px-4 py-2",
            "rounded-full border bg-zinc-900/60 border-zinc-500",
            "backdrop-blur-md"
          )}
        >
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
            >
              <HomeIcon className="w-5 h-5 text-white" />
            </Link>
            <h1 className="text-white text-lg font-medium">Telkom AI API</h1>
          </div>
          {session && (
            <div className="flex items-center gap-4">
              <span className="text-white text-sm font-bold">
                {session.user?.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="px-3 py-1.5 text-sm rounded-full bg-zinc-200 hover:bg-zinc-400 text-zinc-950 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}
