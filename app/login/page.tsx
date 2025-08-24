'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, BookOpen, User, GraduationCap, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { authAPI } from '@/lib/api'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import LanguageToggle from '@/components/LanguageToggle'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    const currentUser = authAPI.getCurrentUser()
    if (currentUser) {
      const redirectPath = currentUser.role === 'teacher' ? '/teacher' : '/dashboard'
      router.push(redirectPath)
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await authAPI.login(email, password, role)
      
      // Redirect based on role
      const redirectPath = role === 'teacher' ? '/teacher' : '/dashboard'
      router.push(redirectPath)
    } catch (error) {
      console.error('Login error:', error)
      setError('Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const fillDemoCredentials = (demoRole: 'student' | 'teacher') => {
    setRole(demoRole)
    setEmail(demoRole === 'student' ? 'student@edubridge.org' : 'teacher@edubridge.org')
    setPassword('demo123')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-primary rounded-lg p-2">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">EduBridge</span>
        </Link>
        <LanguageToggle />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Welcome Section */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {t('auth.welcome')}
            </h1>
            <p className="text-muted-foreground">
              {t('auth.subtitle')}
            </p>
          </div>

          {/* Login Card */}
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                {t('auth.loginButton')}
              </CardTitle>
              <CardDescription className="text-center">
                Choose your role and enter your credentials
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">{t('auth.role')}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={cn(
                        "flex flex-col items-center space-y-2 p-4 rounded-lg border-2 transition-colors",
                        role === 'student'
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-muted-foreground"
                      )}
                    >
                      <GraduationCap className="h-6 w-6" />
                      <span className="font-medium">{t('auth.student')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('teacher')}
                      className={cn(
                        "flex flex-col items-center space-y-2 p-4 rounded-lg border-2 transition-colors",
                        role === 'teacher'
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-muted-foreground"
                      )}
                    >
                      <User className="h-6 w-6" />
                      <span className="font-medium">{t('auth.teacher')}</span>
                    </button>
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    {t('auth.email')}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !email || !password}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    t('auth.loginButton')
                  )}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Try EduBridge with demo credentials:
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemoCredentials('student')}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Demo Student
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemoCredentials('teacher')}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Demo Teacher
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              EduBridge: AI-powered learning for underserved communities
            </p>
            <div className="flex justify-center space-x-4 text-xs text-muted-foreground">
              <Link href="/about" className="hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/help" className="hover:text-foreground transition-colors">
                Help
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground">
        <p>© 2024 EduBridge. Supporting UN SDG 4: Quality Education for All.</p>
      </footer>
    </div>
  )
}
