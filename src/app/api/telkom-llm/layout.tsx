'use client'

import React, { useState } from 'react'
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar'
import { IconHome, IconHistory, IconSettings } from '@tabler/icons-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function ApiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [temperature, setTemperature] = useState(50)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const links = [
    {
      label: 'Home',
      href: '/',
      icon: <IconHome className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: 'History',
      href: '#',
      icon: <IconHistory className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: 'Settings',
      href: '#',
      icon: <IconSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: () => setIsSettingsOpen(true),
    },
  ]

  return (
    <div className={cn(
      "flex h-screen bg-gray-100 dark:bg-background",
      "overflow-hidden border border-neutral-200 dark:border-neutral-700"
    )}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody>
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <Logo />
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      <main className="flex-1 overflow-y-auto p-4">
        {children}
      </main>
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>LLM Settings</SheetTitle>
            <SheetDescription>
              Adjust the settings for the Language Model here.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="system-prompt" className="text-right">
                System Prompt
              </Label>
              <Input 
                id="system-prompt" 
                value={systemPrompt} 
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="temperature" className="text-right">
                Temperature
              </Label>
              <div className="col-span-3 flex items-center">
                <Slider
                  id="temperature"
                  defaultValue={[temperature]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setTemperature(value[0])}
                  className="w-full"
                />
                <span className="text-sm font-medium ml-2">{temperature}</span>
              </div>
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">Save changes</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

const Logo = () => {
  return (
    <Link href="/api/telkom-llm" className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Telkom LLM
      </motion.span>
    </Link>
  )
}
