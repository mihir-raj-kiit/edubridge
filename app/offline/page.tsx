'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  WifiOff, 
  RefreshCw, 
  BookOpen, 
  Brain, 
  Heart, 
  Calendar,
  ArrowLeft,
  Info,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { authAPI } from '@/lib/api'
import { 
  flashcardStorage, 
  quizStorage, 
  wellnessStorage, 
  chatStorage,
  bulkStorage,
  type FlashCard,
  type Quiz,
  type WellnessRecord,
  type ChatMessage
} from '@/lib/storage'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import FlashcardCarousel from '@/components/FlashcardCarousel'

export default function OfflinePage() {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)
  const [isOnline, setIsOnline] = useState(false)
  const [offlineData, setOfflineData] = useState({
    flashcards: [] as FlashCard[],
    quizzes: [] as Quiz[],
    wellnessRecords: [] as WellnessRecord[],
    chatHistory: [] as ChatMessage[]
  })
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quizzes' | 'wellness' | 'chat'>('flashcards')
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    const currentUser = authAPI.getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser({ email: currentUser.email, role: currentUser.role })
  }, [router])

  // Monitor online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    setIsOnline(navigator.onLine)
    
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // Load offline data
  useEffect(() => {
    const loadOfflineData = () => {
      const data = bulkStorage.exportAll()
      setOfflineData({
        flashcards: data.flashcards,
        quizzes: data.quizzes,
        wellnessRecords: data.wellnessRecords,
        chatHistory: data.chatHistory
      })
      setLastSync(data.lastSync)
    }

    loadOfflineData()
  }, [])

  const handleRetryConnection = () => {
    if (navigator.onLine) {
      // Redirect back to dashboard
      const redirectPath = user?.role === 'teacher' ? '/teacher' : '/dashboard'
      router.push(redirectPath)
    } else {
      // Attempt to check connection
      fetch('/api/health', { method: 'HEAD' })
        .then(() => {
          setIsOnline(true)
          const redirectPath = user?.role === 'teacher' ? '/teacher' : '/dashboard'
          router.push(redirectPath)
        })
        .catch(() => {
          setIsOnline(false)
        })
    }
  }

  const goBack = () => {
    router.back()
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'flashcards':
        return (
          <div className="space-y-4">
            {offlineData.flashcards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No flashcards saved offline</p>
              </div>
            ) : (
              <FlashcardCarousel 
                flashcards={offlineData.flashcards} 
                title="Offline Flashcards"
              />
            )}
          </div>
        )

      case 'quizzes':
        return (
          <div className="space-y-4">
            {offlineData.quizzes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No quizzes saved offline</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offlineData.quizzes.map((quiz) => (
                  <Card key={quiz.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Questions:</span>
                          <Badge variant="secondary">{quiz.questions.length}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Created: {new Date(quiz.createdAt).toLocaleDateString()}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled
                          className="w-full"
                        >
                          Available when online
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )

      case 'wellness':
        return (
          <div className="space-y-4">
            {offlineData.wellnessRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No wellness records saved offline</p>
              </div>
            ) : (
              <div className="space-y-3">
                {offlineData.wellnessRecords.slice(-10).reverse().map((record) => (
                  <Card key={record.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={
                              record.stressLevel === 'low' ? 'default' :
                              record.stressLevel === 'medium' ? 'secondary' : 'destructive'
                            }
                          >
                            {record.stressLevel} stress
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Score: {record.wellnessScore}/100
                          </span>
                        </div>
                        
                        <div className="text-sm">
                          <div className="font-medium mb-1">Your input:</div>
                          <div className="text-muted-foreground italic">
                            "{record.text}"
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          <div className="font-medium mb-1">AI Suggestion:</div>
                          <div className="text-muted-foreground">
                            {record.suggestion}
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          {new Date(record.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )

      case 'chat':
        return (
          <div className="space-y-4">
            {offlineData.chatHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No chat history saved offline</p>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Recent AI Tutor Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {offlineData.chatHistory.slice(-20).map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.sender === 'user' ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm",
                            message.sender === 'user'
                              ? "chat-bubble-user"
                              : "chat-bubble-ai"
                          )}
                        >
                          <p className="whitespace-pre-wrap">{message.message}</p>
                          <div className={cn(
                            "text-xs opacity-70 mt-1",
                            message.sender === 'user' ? "text-right" : "text-left"
                          )}>
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      default:
        return null
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="space-y-6">
          {/* Back Button */}
          <Button 
            variant="outline" 
            onClick={goBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          {/* Offline Status */}
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="bg-orange-100 p-3 rounded-full dark:bg-orange-900/40">
                  <WifiOff className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-orange-800 dark:text-orange-400">
                    {t('common.offline')}
                  </h1>
                  <p className="text-orange-700 dark:text-orange-300">
                    You're currently offline. Here's your saved content that you can still access.
                  </p>
                </div>
                <Button 
                  onClick={handleRetryConnection}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Retry</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sync Status */}
          {lastSync && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Last synced: {new Date(lastSync).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg dark:bg-blue-900/20">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Flashcards</p>
                    <p className="text-2xl font-bold">{offlineData.flashcards.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg dark:bg-green-900/20">
                    <Brain className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quizzes</p>
                    <p className="text-2xl font-bold">{offlineData.quizzes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg dark:bg-purple-900/20">
                    <Heart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Wellness</p>
                    <p className="text-2xl font-bold">{offlineData.wellnessRecords.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg dark:bg-orange-900/20">
                    <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Messages</p>
                    <p className="text-2xl font-bold">{offlineData.chatHistory.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Tabs */}
          <Card>
            <CardHeader>
              <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
                {[
                  { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
                  { id: 'quizzes', label: 'Quizzes', icon: Brain },
                  { id: 'wellness', label: 'Wellness', icon: Heart },
                  { id: 'chat', label: 'Chat History', icon: BookOpen }
                ].map((tab) => {
                  const IconComponent = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                        activeTab === tab.id
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </CardHeader>

            <CardContent>
              {renderTabContent()}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-2">
                  <div className="font-medium">Offline Mode Tips:</div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                    <li>You can still review your saved flashcards and previous wellness records</li>
                    <li>Your progress and new content will sync when you're back online</li>
                    <li>Some features like AI tutoring require an internet connection</li>
                    <li>Use this time to review and reinforce what you've already learned</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connection Status */}
          {isOnline && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2 text-green-800 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Connection restored! You can now return to the main app.</span>
                  <Button 
                    onClick={() => router.push(user.role === 'teacher' ? '/teacher' : '/dashboard')}
                    size="sm"
                    className="ml-auto"
                  >
                    Continue Learning
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
