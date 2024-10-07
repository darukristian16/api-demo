'use client'

import { useState } from 'react'
import { projects } from "@/data/projectsData"

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function TelkomLLMDemo() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const project = projects.find(p => p.slug === 'telkom-llm')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessages(prev => [...prev, { role: 'user', content: input }])
  
    try {
      const response = await fetch(project?.link ?? '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'uxfd2NWrs4e1DBksuZ93KnWKBsQQe8Pa'
        },
        body: JSON.stringify({
          message: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: input }
          ],
          temperature: 0,
          max_gen_len: 100
        })
      })

      const data = await response.json()
      const assistantMessage = data.choices?.[0]?.message?.content || 'No response from assistant'
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error occurred while fetching response' }])
    } finally {
      setInput('')
    }
  }
  return (
    <div>
      <h1>{project?.title}</h1>
      <p>{project?.description}</p>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}
