'use client'

import { useState, useRef, useEffect } from 'react'
import { projects } from "@/data/projectsData"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { IconSend, IconRobot } from '@tabler/icons-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { sendMessage } from '@/lib/api'


interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function TelkomLLMDemo() {
  const [input, setInput] = useState('')
  const [conversation, setConversation] = useState<Message[]>([])
  const project = projects.find(p => p.slug === 'telkom-llm')
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [conversation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await sendMessage(input, conversation)
    setConversation([...result.updatedConversation, { role: 'assistant', content: result.message }])
    setInput('')
  }  

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{project?.title}</h1>
      <p className="mb-4">{project?.description}</p>
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 border rounded-lg"
      >
        {conversation.map((msg, index) => (
          <div key={index} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
            <div className="flex items-center mb-1">
              {msg.role === 'assistant' && <IconRobot className="h-4 w-4 mr-1" />}
              <span className="text-xs text-gray-500">
                {msg.role === 'user' ? 'You' : 'Assistant'}
              </span>
            </div>
            <Card className={cn("max-w-[80%]", msg.role === 'user' ? "bg-background text-white" : "bg-background")}>
              <CardContent className="p-3">
                <p>{msg.content}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className='flex items-center gap-2'>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here."
          className="flex-1 min-h-[50px] resize-none"
        />
        <Button type="submit" size ="icon" className='h-[50px] w-[50px]'>
          <IconSend className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
