'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check localStorage directly to avoid import issues
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        const role = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null
        
        if (token && role) {
          // Redirect based on role
          const redirectPath = role === 'teacher' ? '/teacher' : '/dashboard'
          router.push(redirectPath)
        } else {
          // Redirect to login
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (!isLoading) {
    return null // Don't render anything after redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-600">Redirecting to EduBridge...</p>
      </div>
    </div>
  )
}
