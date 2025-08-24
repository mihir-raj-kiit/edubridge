'use client'

import { useState, useEffect } from 'react'
import { WifiOff, Wifi, AlertCircle } from 'lucide-react'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface OfflineBannerProps {
  className?: string
}

export default function OfflineBanner({ className }: OfflineBannerProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check initial connection status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowBanner(true)
      // Hide banner after 3 seconds when coming back online
      setTimeout(() => setShowBanner(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowBanner(true)
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Show banner initially if offline
    if (!navigator.onLine) {
      setShowBanner(true)
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Don't render anything if we shouldn't show the banner
  if (!showBanner) return null

  return (
    <div className={cn(
      "fixed top-16 left-0 right-0 z-40 transition-all duration-300 animate-slide-up",
      className
    )}>
      <div className={cn(
        "mx-4 rounded-lg border shadow-lg p-3 flex items-center space-x-3",
        isOnline 
          ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
          : "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400"
      )}>
        {isOnline ? (
          <>
            <Wifi className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 text-sm">
              <span className="font-medium">Connection restored!</span>
              <span className="ml-2">You're back online.</span>
            </div>
          </>
        ) : (
          <>
            <WifiOff className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 text-sm">
              <div className="font-medium flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>{t('common.offline')}</span>
              </div>
              <div className="mt-1 text-xs opacity-90">
                {t('common.reconnecting')} Showing cached content.
              </div>
            </div>
          </>
        )}
        
        {/* Close button */}
        <button
          onClick={() => setShowBanner(false)}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Dismiss notification"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
