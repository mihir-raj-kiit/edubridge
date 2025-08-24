'use client'

import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCurrentLanguage, setLanguage, getAvailableLanguages, type Language } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface LanguageToggleProps {
  className?: string
}

export default function LanguageToggle({ className }: LanguageToggleProps) {
  const [currentLang, setCurrentLang] = useState<Language>('en')
  const [isOpen, setIsOpen] = useState(false)
  const availableLanguages = getAvailableLanguages()

  useEffect(() => {
    setCurrentLang(getCurrentLanguage())
  }, [])

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    setCurrentLang(lang)
    setIsOpen(false)
    
    // Trigger a page refresh to update all translations
    // In a real app, you'd use a context provider to avoid this
    window.location.reload()
  }

  const currentLanguage = availableLanguages.find(lang => lang.code === currentLang)

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLanguage?.name}</span>
        <span className="sm:hidden">{currentLang.toUpperCase()}</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg z-20">
            <div className="py-1" role="menu" aria-orientation="vertical">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                    currentLang === lang.code && "bg-accent text-accent-foreground font-medium"
                  )}
                  role="menuitem"
                >
                  <div className="flex items-center justify-between">
                    <span>{lang.name}</span>
                    {currentLang === lang.code && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
