'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authAPI.getCurrentUser()
    
    if (currentUser) {
      // Redirect based on role
      const redirectPath = currentUser.role === 'teacher' ? '/teacher' : '/dashboard'
      router.push(redirectPath)
    } else {
      // Redirect to login
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Redirecting to EduBridge...</p>
      </div>
    </div>
  )
}
