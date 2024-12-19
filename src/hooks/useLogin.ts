import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function useLogin() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      const response = await signIn('credentials', {
        username: formData.get('username'),
        password: formData.get('password'),
        redirect: false,
      })

      if (response?.error) {
        setError('Invalid credentials')
        throw new Error(response.error)
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    error,
    isLoading,
    handleSubmit
  }
}
