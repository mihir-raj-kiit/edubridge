'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, LogOut, User, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authAPI } from '@/lib/api'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import LanguageToggle from './LanguageToggle'

interface NavbarProps {
  className?: string
}

export default function Navbar({ className }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const currentUser = authAPI.getCurrentUser()
    if (currentUser) {
      setUser({ email: currentUser.email, role: currentUser.role })
    }
  }, [])

  const handleLogout = () => {
    authAPI.logout()
    setUser(null)
    router.push('/login')
  }

  const toggleMenu = () => setIsOpen(!isOpen)

  const navLinks = user ? [
    {
      href: user.role === 'teacher' ? '/teacher' : '/dashboard',
      label: user.role === 'teacher' ? t('nav.teacher') : t('nav.dashboard'),
      icon: BookOpen
    },
    {
      href: '/settings',
      label: t('nav.settings'),
      icon: User
    }
  ] : []

  return (
    <nav className={cn(
      "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={user ? (user.role === 'teacher' ? '/teacher' : '/dashboard') : '/'} className="flex items-center space-x-2">
              <div className="bg-primary rounded-lg p-2">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">EduBridge</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => {
                const IconComponent = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center space-x-1 text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right side items */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageToggle />
            
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('nav.logout')}</span>
                </Button>
              </div>
            ) : (
              <Button asChild>
                <Link href="/login">{t('nav.login')}</Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-expanded="false"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
            {navLinks.map((link) => {
              const IconComponent = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
            
            {user ? (
              <div className="pt-4 pb-3 border-t border-border">
                <div className="flex items-center px-3 mb-3">
                  <div className="text-base font-medium text-foreground">{user.email}</div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="mx-3 flex items-center space-x-2 w-auto"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('nav.logout')}</span>
                </Button>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-border">
                <Button asChild className="mx-3">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    {t('nav.login')}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
