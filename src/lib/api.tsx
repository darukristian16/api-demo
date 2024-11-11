import { projects } from "@/data/projectsData"

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function sendMessage(input: string, conversation: Message[], temperature: number = 0, max_gen_len: number = 100): Promise <{
    success: boolean;
    message: string;
    updatedConversation: Message[];
}> {
  const project = projects.find(p => p.slug === 'telkom-llm')
  const updatedConversation = [...conversation, { role: 'user', content: input }]
  const apiKey = process.env.NEXT_PUBLIC_TELKOM_LLM_API_KEY || ''

  try {
    const response = await fetch(project?.link ?? '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        message: updatedConversation,
        temperature,
        max_gen_len
      })
    })

    const data = await response.json()
    console.log('API Response:', data)

    if (data.result) {
      updatedConversation.push({ role: 'assistant', content: data.result });
    }

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
