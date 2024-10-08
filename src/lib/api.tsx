import { projects } from "@/data/projectsData"

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function sendMessage(input: string, conversation: Message[]): Promise <{
    success: boolean;
    message: string;
    updatedConversation: Message[];
}> {
  const project = projects.find(p => p.slug === 'telkom-llm')
  const updatedConversation = [...conversation, { role: 'user', content: input }]

  try {
    const response = await fetch(project?.link ?? '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'evDH5X140AYLrPf8D6QC1ZQh9o031LPg'
      },
      body: JSON.stringify({
        text_input: JSON.stringify(updatedConversation),
        max_gen_len: 2000
      })
    })

    const data = await response.json()
    console.log('API Response:', data)

    return { 
      success: true, 
      message: data.result || 'No response from assistant',
      updatedConversation: updatedConversation as Message[]
    }
  } catch (error) {
    console.error('Error:', error)
    return { 
      success: false, 
      message: 'Error occurred while fetching response',
      updatedConversation: updatedConversation as Message[]
    }
  }
}
