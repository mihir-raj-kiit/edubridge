'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, Upload, MessageSquare, Heart, BookOpen, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { authAPI } from '@/lib/api'
import { flashcardStorage, quizStorage, wellnessStorage, knowledgeMapStorage, type FlashCard, type KnowledgeMap as KnowledgeMapType } from '@/lib/storage'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'
import OfflineBanner from '@/components/OfflineBanner'
import ChatBox from '@/components/ChatBox'
import FileUpload from '@/components/FileUpload'
import FlashcardCarousel from '@/components/FlashcardCarousel'
import KnowledgeMap from '@/components/KnowledgeMap'
import QuizCard from '@/components/QuizCard'
import WellnessCheckForm from '@/components/WellnessCheckForm'

export default function StudentDashboard() {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)
  const [flashcards, setFlashcards] = useState<FlashCard[]>([])
  const [knowledgeMaps, setKnowledgeMaps] = useState<KnowledgeMapType[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [activeSection, setActiveSection] = useState<'overview' | 'ai-tutor' | 'upload' | 'quizzes' | 'wellness'>('overview')
  const [wellnessScore, setWellnessScore] = useState<number | null>(null)
  const router = useRouter()

  // Authentication check
  useEffect(() => {
    const currentUser = authAPI.getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    if (currentUser.role !== 'student') {
      router.push('/teacher')
      return
    }
    setUser({ email: currentUser.email, role: currentUser.role })
  }, [router])

  // Handle URL fragments and synchronize with sidebar
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1) // Remove the '#'
      
      if (hash && ['ai-tutor', 'upload', 'quizzes', 'wellness'].includes(hash)) {
        setActiveSection(hash as any)
      } else {
        setActiveSection('overview')
      }
    }

    // Check initial hash
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  // Load data from storage
  useEffect(() => {
    const loadData = () => {
      const savedFlashcards = flashcardStorage.getAll()
      const savedKnowledgeMaps = knowledgeMapStorage.getAll()
      const savedQuizzes = quizStorage.getAll()
      const recentWellness = wellnessStorage.getLast30Days()

      setFlashcards(savedFlashcards)
      setKnowledgeMaps(savedKnowledgeMaps)
      setQuizzes(savedQuizzes)

      // Calculate average wellness score
      if (recentWellness.length > 0) {
        const avgScore = Math.round(
          recentWellness.reduce((sum, record) => sum + record.wellnessScore, 0) / recentWellness.length
        )
        setWellnessScore(avgScore)
      }
    }

    loadData()
  }, [])

  const handleNewFlashcards = (newFlashcards: FlashCard[]) => {
    setFlashcards(prev => [...prev, ...newFlashcards])
  }

  const handleNewKnowledgeMap = (newKnowledgeMap: KnowledgeMapType) => {
    setKnowledgeMaps(prev => [...prev, newKnowledgeMap])
  }

  const handleQuizComplete = (score: number, total: number) => {
    // Could implement quiz completion logic here
    console.log(`Quiz completed: ${score}/${total}`)
  }

  // Handle section change and update URL
  const handleSectionChange = (section: 'overview' | 'ai-tutor' | 'upload' | 'quizzes' | 'wellness') => {
    setActiveSection(section)
    
    // Update URL without page reload
    if (section === 'overview') {
      window.history.pushState(null, '', '/dashboard')
    } else {
      window.history.pushState(null, '', `/dashboard#${section}`)
    }
  }

  // Mock quiz data for demonstration
  const mockQuiz = {
    id: 'demo-quiz-1',
    title: 'Mathematics Basics',
    questions: [
      {
        id: 'q1',
        question: 'What is 15 + 27?',
        options: ['40', '42', '45', '47'],
        correct: 1
      },
      {
        id: 'q2',
        question: 'What is the square root of 64?',
        options: ['6', '7', '8', '9'],
        correct: 2
      },
      {
        id: 'q3',
        question: 'If x + 5 = 12, what is x?',
        options: ['5', '6', '7', '8'],
        correct: 2
      }
    ]
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'ai-tutor':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('dashboard.aiTutor')}</h2>
              <p className="text-muted-foreground">
                Ask your AI tutor any questions about your studies. Get instant help with explanations, problem-solving, and concept clarification.
              </p>
            </div>
            <ChatBox />
          </div>
        )

      case 'upload':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('dashboard.uploadNotes')}</h2>
              <p className="text-muted-foreground">
                Upload your handwritten notes and let AI convert them into interactive flashcards and knowledge maps for better studying.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FileUpload
                onFlashcardsGenerated={handleNewFlashcards}
                onKnowledgeMapGenerated={handleNewKnowledgeMap}
              />
              <FlashcardCarousel flashcards={flashcards} />
            </div>
            {knowledgeMaps.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Knowledge Maps</h3>
                <div className="space-y-4">
                  {knowledgeMaps.slice(-3).map((map, index) => (
                    <KnowledgeMap
                      key={map.id}
                      data={{ graphs: map.graphs }}
                      className="mb-4"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'quizzes':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('dashboard.myQuizzes')}</h2>
              <p className="text-muted-foreground">
                Test your knowledge with interactive quizzes and track your progress over time.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuizCard quiz={mockQuiz} onComplete={handleQuizComplete} />
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">85%</div>
                      <div className="text-sm text-muted-foreground">Average Score</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Quizzes Completed</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Best Score</span>
                        <span className="font-medium">98%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Study Streak</span>
                        <span className="font-medium">7 days</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'wellness':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('dashboard.wellnessCheck')}</h2>
              <p className="text-muted-foreground">
                Monitor your mental health and get personalized suggestions for maintaining a healthy study-life balance.
              </p>
            </div>
            <WellnessCheckForm />
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
              <h1 className="text-3xl font-bold mb-2">
                {t('dashboard.welcome')}, {user.email.split('@')[0]}! 👋
              </h1>
              <p className="text-muted-foreground text-lg">
                Ready to learn something new today? Choose from the options below to get started.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg dark:bg-blue-900/20">
                      <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Flashcards</p>
                      <p className="text-2xl font-bold">{flashcards.length}</p>
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
                      <p className="text-2xl font-bold">{quizzes.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-lg dark:bg-purple-900/20">
                      <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Study Streak</p>
                      <p className="text-2xl font-bold">7 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-lg dark:bg-orange-900/20">
                      <Heart className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Wellness</p>
                      <p className="text-2xl font-bold">{wellnessScore || '--'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSectionChange('ai-tutor')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <span>{t('dashboard.aiTutor')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Get instant help with your studies. Ask questions, solve problems, and learn concepts with AI assistance.
                  </p>
                  <Badge variant="secondary">Interactive Learning</Badge>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSectionChange('upload')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-5 w-5 text-primary" />
                    <span>{t('dashboard.uploadNotes')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Transform your handwritten notes into digital flashcards using AI-powered OCR technology.
                  </p>
                  <Badge variant="secondary">AI-Powered OCR</Badge>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSectionChange('quizzes')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <span>{t('dashboard.myQuizzes')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Test your knowledge with interactive quizzes and track your learning progress over time.
                  </p>
                  <Badge variant="secondary">Knowledge Testing</Badge>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSectionChange('wellness')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-primary" />
                    <span>{t('dashboard.wellnessCheck')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Monitor your mental health and get personalized suggestions for maintaining wellness.
                  </p>
                  <Badge variant="secondary">Mental Health Support</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            {flashcards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Flashcards</CardTitle>
                </CardHeader>
                <CardContent>
                  <FlashcardCarousel 
                    flashcards={flashcards.slice(-5)} 
                    title="Latest Flashcards"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />
      <Navbar />
      
      <div className="flex">
        <Sidebar userRole="student" />
        
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Navigation Tabs */}
            <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg w-fit">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpen },
                { id: 'ai-tutor', label: 'AI Tutor', icon: MessageSquare },
                { id: 'upload', label: 'Upload Notes', icon: Upload },
                { id: 'quizzes', label: 'Quizzes', icon: Brain },
                { id: 'wellness', label: 'Wellness', icon: Heart }
              ].map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSectionChange(tab.id as any)}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      activeSection === tab.id
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Content */}
            {renderContent()}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
