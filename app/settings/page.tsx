'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Globe, 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  Shield, 
  Download,
  Trash2,
  Save,
  RefreshCw,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { authAPI } from '@/lib/api'
import { 
  preferencesStorage, 
  bulkStorage, 
  storageUtils, 
  type UserPreferences 
} from '@/lib/storage'
import { 
  getCurrentLanguage, 
  setLanguage, 
  getAvailableLanguages, 
  type Language,
  t 
} from '@/lib/i18n'
import { cn } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'
import OfflineBanner from '@/components/OfflineBanner'

type Theme = 'light' | 'dark' | 'system'

export default function SettingsPage() {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'en',
    theme: 'system',
    notifications: true,
    autoSync: true
  })
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState({ name: '', email: '' })
  const [storageInfo, setStorageInfo] = useState({ size: 0, items: 0 })
  const router = useRouter()

  // Authentication check
  useEffect(() => {
    const currentUser = authAPI.getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser({ email: currentUser.email, role: currentUser.role })
    setProfileData({ 
      name: currentUser.email.split('@')[0], 
      email: currentUser.email 
    })
  }, [router])

  // Load preferences
  useEffect(() => {
    const savedPreferences = preferencesStorage.get()
    const currentLang = getCurrentLanguage()
    setPreferences({
      ...savedPreferences,
      language: currentLang
    })
  }, [])

  // Load storage info
  useEffect(() => {
    const updateStorageInfo = () => {
      const data = bulkStorage.exportAll()
      const totalItems = data.flashcards.length + data.quizzes.length + data.wellnessRecords.length + data.chatHistory.length
      const sizeInMB = storageUtils.getUsageMB()
      
      setStorageInfo({
        size: sizeInMB,
        items: totalItems
      })
    }

    updateStorageInfo()
  }, [])

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    setPreferences(prev => ({ ...prev, language: lang }))
    // Note: In a real app, you'd use context to avoid page reload
    setTimeout(() => window.location.reload(), 100)
  }

  const handleThemeChange = (theme: Theme) => {
    setPreferences(prev => ({ ...prev, theme }))
    
    // Apply theme immediately
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // System theme
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (systemPrefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  const handleSavePreferences = async () => {
    setIsSaving(true)
    
    try {
      preferencesStorage.set(preferences)
      
      // Show success feedback
      setTimeout(() => {
        setIsSaving(false)
      }, 1000)
    } catch (error) {
      console.error('Error saving preferences:', error)
      setIsSaving(false)
    }
  }

  const handleExportData = () => {
    const data = bulkStorage.exportAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `edubridge-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all local data? This action cannot be undone.')) {
      bulkStorage.clearAll()
      setStorageInfo({ size: 0, items: 0 })
    }
  }

  const handleSyncData = () => {
    // In a real app, this would sync with the backend
    console.log('Syncing data with server...')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const availableLanguages = getAvailableLanguages()

  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />
      <Navbar />
      
      <div className="flex">
        <Sidebar userRole={user.role as 'student' | 'teacher'} />
        
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">{t('nav.settings')}</h1>
              <p className="text-muted-foreground">
                Manage your account settings, preferences, and data.
              </p>
            </div>

            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>{t('settings.profile')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant={user.role === 'teacher' ? 'default' : 'secondary'}>
                    {user.role === 'teacher' ? 'Teacher' : 'Student'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Account type</span>
                </div>
              </CardContent>
            </Card>

            {/* Language Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <span>{t('settings.language')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred language for the interface.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {availableLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={cn(
                          "p-3 text-left rounded-lg border transition-colors",
                          preferences.language === lang.code
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-muted-foreground hover:bg-accent"
                        )}
                      >
                        <div className="font-medium">{lang.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {lang.code.toUpperCase()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  <span>{t('settings.theme')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme appearance.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { id: 'light', label: t('settings.light'), icon: Sun },
                      { id: 'dark', label: t('settings.dark'), icon: Moon },
                      { id: 'system', label: t('settings.system'), icon: Monitor }
                    ].map((theme) => {
                      const IconComponent = theme.icon
                      return (
                        <button
                          key={theme.id}
                          onClick={() => handleThemeChange(theme.id as Theme)}
                          className={cn(
                            "p-3 text-left rounded-lg border transition-colors flex items-center space-x-3",
                            preferences.theme === theme.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-muted-foreground hover:bg-accent"
                          )}
                        >
                          <IconComponent className="h-5 w-5" />
                          <span className="font-medium">{theme.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <span>Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Study Reminders</div>
                    <div className="text-sm text-muted-foreground">
                      Get reminded to review flashcards and take quizzes
                    </div>
                  </div>
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, notifications: !prev.notifications }))}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      preferences.notifications ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        preferences.notifications ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto Sync</div>
                    <div className="text-sm text-muted-foreground">
                      Automatically sync data with the server when online
                    </div>
                  </div>
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, autoSync: !prev.autoSync }))}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      preferences.autoSync ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        preferences.autoSync ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Data Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Storage Info */}
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <div className="flex items-center space-x-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Local Storage Usage</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Storage Size:</span>
                      <span className="ml-2 font-medium">{storageInfo.size.toFixed(2)} MB</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Items Stored:</span>
                      <span className="ml-2 font-medium">{storageInfo.items}</span>
                    </div>
                  </div>
                </div>

                {/* Data Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleExportData}
                    className="flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Data</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleSyncData}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Sync Data</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleClearData}
                    className="flex items-center space-x-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Clear Data</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : t('common.save')}</span>
              </Button>
            </div>

            {/* App Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">EduBridge v1.0.0</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered learning platform for underserved communities
                  </p>
                  <div className="flex justify-center space-x-4 text-xs text-muted-foreground">
                    <span>© 2024 EduBridge</span>
                    <span>•</span>
                    <span>Supporting UN SDG 4</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
