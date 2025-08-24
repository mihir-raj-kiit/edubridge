'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  MessageSquare, 
  Upload, 
  Brain, 
  Heart, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Users,
  BarChart3,
  PlusCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
  userRole?: 'student' | 'teacher'
}

export default function Sidebar({ className, userRole = 'student' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [currentHash, setCurrentHash] = useState('')
  const pathname = usePathname()

  // Track hash changes for active state
  useEffect(() => {
    const updateHash = () => {
      setCurrentHash(window.location.hash)
    }
    
    // Set initial hash
    updateHash()
    
    // Listen for hash changes
    window.addEventListener('hashchange', updateHash)
    
    return () => {
      window.removeEventListener('hashchange', updateHash)
    }
  }, [])

  // Define navigation items based on user role
  const studentNavItems = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: t('nav.dashboard'),
      description: 'Your learning hub'
    },
    {
      href: '/dashboard#ai-tutor',
      icon: MessageSquare,
      label: t('dashboard.aiTutor'),
      description: 'Ask questions'
    },
    {
      href: '/dashboard#upload',
      icon: Upload,
      label: t('dashboard.uploadNotes'),
      description: 'Convert notes to flashcards'
    },
    {
      href: '/dashboard#quizzes',
      icon: Brain,
      label: t('dashboard.myQuizzes'),
      description: 'Practice and test'
    },
    {
      href: '/dashboard#wellness',
      icon: Heart,
      label: t('dashboard.wellnessCheck'),
      description: 'Check your wellbeing'
    }
  ]

  const teacherNavItems = [
    {
      href: '/teacher',
      icon: LayoutDashboard,
      label: t('teacher.dashboard'),
      description: 'Teacher overview'
    },
    {
      href: '/teacher#content',
      icon: PlusCircle,
      label: t('teacher.createFlashcards'),
      description: 'Create learning content'
    },
    {
      href: '/teacher#engagement',
      icon: BarChart3,
      label: t('teacher.studentEngagement'),
      description: 'Track student progress'
    },
    {
      href: '/teacher#manage',
      icon: Users,
      label: t('teacher.manageQuizzes'),
      description: 'Manage assessments'
    }
  ]

  const navItems = userRole === 'teacher' ? teacherNavItems : studentNavItems

  const isItemActive = (href: string) => {
    if (href.includes('#')) {
      // For fragment links, check both path and hash
      const [linkPath, linkHash] = href.split('#')
      return pathname === linkPath && currentHash === `#${linkHash}`
    } else {
      // For non-fragment links, check path and ensure no hash
      return pathname === href && !currentHash
    }
  }

  return (
    <div className={cn(
      "flex flex-col bg-card border-r border-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="bg-primary rounded-lg p-1.5">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">
              {userRole === 'teacher' ? 'Teacher' : 'Student'}
            </span>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const IconComponent = item.icon
            const active = isItemActive(item.href)
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                    active 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <IconComponent className={cn(
                    "h-5 w-5 flex-shrink-0",
                    active ? "text-primary-foreground" : "group-hover:text-foreground"
                  )} />
                  
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.label}</div>
                      <div className={cn(
                        "text-xs opacity-75 truncate",
                        active ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {item.description}
                      </div>
                    </div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Settings Link */}
      <div className="p-2 border-t border-border">
        <Link
          href="/settings"
          className={cn(
            "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
            pathname === '/settings' && "bg-primary text-primary-foreground",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? t('nav.settings') : undefined}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <span>{t('nav.settings')}</span>
          )}
        </Link>
      </div>
    </div>
  )
}
