'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  PlusCircle, 
  BarChart3, 
  FileText, 
  Brain, 
  TrendingUp,
  Calendar,
  Star,
  BookOpen,
  Upload,
  Download,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { authAPI, teacherAPI } from '@/lib/api'
import { flashcardStorage, quizStorage, type FlashCard } from '@/lib/storage'
import { t } from '@/lib/i18n'
import { cn, generateId } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'
import OfflineBanner from '@/components/OfflineBanner'

interface NewFlashcard {
  question: string
  answer: string
  subject: string
}

export default function TeacherDashboard() {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)
  const [activeSection, setActiveSection] = useState<'overview' | 'content' | 'engagement' | 'manage'>('overview')
  const [newFlashcard, setNewFlashcard] = useState<NewFlashcard>({ question: '', answer: '', subject: '' })
  const [flashcards, setFlashcards] = useState<FlashCard[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  // Authentication check
  useEffect(() => {
    const currentUser = authAPI.getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    if (currentUser.role !== 'teacher') {
      router.push('/dashboard')
      return
    }
    setUser({ email: currentUser.email, role: currentUser.role })
  }, [router])

  // Handle URL fragments and synchronize with sidebar
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1) // Remove the '#'
      
      if (hash && ['content', 'engagement', 'manage'].includes(hash)) {
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

  // Load flashcards
  useEffect(() => {
    const savedFlashcards = flashcardStorage.getAll()
    setFlashcards(savedFlashcards)
  }, [])

  // Handle section change and update URL
  const handleSectionChange = (section: 'overview' | 'content' | 'engagement' | 'manage') => {
    setActiveSection(section)
    
    // Update URL without page reload
    if (section === 'overview') {
      window.history.pushState(null, '', '/teacher')
    } else {
      window.history.pushState(null, '', `/teacher#${section}`)
    }
  }

  const handleCreateFlashcard = async () => {
    if (!newFlashcard.question.trim() || !newFlashcard.answer.trim()) return

    setIsCreating(true)

    try {
      const flashcard: FlashCard = {
        id: generateId(),
        question: newFlashcard.question.trim(),
        answer: newFlashcard.answer.trim(),
        subject: newFlashcard.subject.trim() || 'General',
        createdAt: new Date().toISOString()
      }

      // Save to storage
      flashcardStorage.add(flashcard)
      setFlashcards(prev => [...prev, flashcard])

      // Try to sync with backend
      try {
        await teacherAPI.uploadFlashcards([{
          question: flashcard.question,
          answer: flashcard.answer,
          subject: flashcard.subject || 'General'
        }])
      } catch (error) {
        console.warn('Could not sync with backend, saved locally:', error)
      }

      // Reset form
      setNewFlashcard({ question: '', answer: '', subject: '' })
    } catch (error) {
      console.error('Error creating flashcard:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteFlashcard = (id: string) => {
    flashcardStorage.remove(id)
    setFlashcards(prev => prev.filter(card => card.id !== id))
  }

  // Mock data for engagement metrics
  const engagementData = {
    totalStudents: 147,
    activeStudents: 89,
    avgSessionTime: '23 min',
    completionRate: 76,
    topSubjects: [
      { name: 'Mathematics', engagement: 92 },
      { name: 'Science', engagement: 87 },
      { name: 'History', engagement: 78 },
      { name: 'Literature', engagement: 71 }
    ],
    recentActivity: [
      { student: 'Sarah M.', action: 'Completed Quiz: Algebra Basics', time: '2 hours ago' },
      { student: 'John D.', action: 'Created 5 flashcards from notes', time: '4 hours ago' },
      { student: 'Maria L.', action: 'Wellness check completed', time: '6 hours ago' },
      { student: 'Ahmed K.', action: 'AI Tutor session: 15 minutes', time: '8 hours ago' }
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
      case 'content':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('teacher.createFlashcards')}</h2>
              <p className="text-muted-foreground">
                Create and manage flashcards for your students. These will be available to all students in your classes.
              </p>
            </div>

            {/* Create New Flashcard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PlusCircle className="h-5 w-5 text-primary" />
                  <span>Create New Flashcard</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input
                      value={newFlashcard.subject}
                      onChange={(e) => setNewFlashcard(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="e.g., Mathematics, Science"
                    />
                  </div>
                  <div className="md:col-span-2"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Question/Front</label>
                    <Textarea
                      value={newFlashcard.question}
                      onChange={(e) => setNewFlashcard(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="Enter the question or term..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Answer/Back</label>
                    <Textarea
                      value={newFlashcard.answer}
                      onChange={(e) => setNewFlashcard(prev => ({ ...prev, answer: e.target.value }))}
                      placeholder="Enter the answer or definition..."
                      rows={4}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCreateFlashcard}
                  disabled={!newFlashcard.question.trim() || !newFlashcard.answer.trim() || isCreating}
                  className="w-full"
                >
                  {isCreating ? 'Creating...' : 'Create Flashcard'}
                </Button>
              </CardContent>
            </Card>

            {/* Existing Flashcards */}
            <Card>
              <CardHeader>
                <CardTitle>Your Flashcards ({flashcards.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {flashcards.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No flashcards created yet. Create your first one above!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {flashcards.map((card) => (
                      <div key={card.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{card.subject}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteFlashcard(card.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            Delete
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">Question</div>
                            <div className="text-sm">{card.question}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">Answer</div>
                            <div className="text-sm">{card.answer}</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(card.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      case 'engagement':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('teacher.studentEngagement')}</h2>
              <p className="text-muted-foreground">
                Monitor student engagement, track progress, and identify students who may need additional support.
              </p>
            </div>

            {/* Engagement Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg dark:bg-blue-900/20">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                      <p className="text-2xl font-bold">{engagementData.totalStudents}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg dark:bg-green-900/20">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Today</p>
                      <p className="text-2xl font-bold">{engagementData.activeStudents}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-lg dark:bg-purple-900/20">
                      <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Session</p>
                      <p className="text-2xl font-bold">{engagementData.avgSessionTime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-lg dark:bg-orange-900/20">
                      <Star className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                      <p className="text-2xl font-bold">{engagementData.completionRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subject Engagement */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engagementData.topSubjects.map((subject) => (
                    <div key={subject.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{subject.name}</span>
                        <span className="text-muted-foreground">{subject.engagement}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${subject.engagement}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Student Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Student Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {engagementData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{activity.student}</div>
                        <div className="text-sm text-muted-foreground">{activity.action}</div>
                        <div className="text-xs text-muted-foreground">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'manage':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('teacher.manageQuizzes')}</h2>
              <p className="text-muted-foreground">
                Create, edit, and manage quizzes for your students. Track quiz performance and adjust difficulty as needed.
              </p>
            </div>

            {/* Quiz Management */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <span>Create New Quiz</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Quiz Title" />
                  <Textarea placeholder="Quiz Description" rows={3} />
                  <div className="flex space-x-2">
                    <Input placeholder="Subject" />
                    <Input placeholder="Duration (min)" type="number" />
                  </div>
                  <Button className="w-full">Create Quiz</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quiz Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Quizzes</span>
                      <span className="font-medium">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average Score</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Completion Rate</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Most Difficult</span>
                      <span className="font-medium">Calculus Quiz</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export/Import Tools */}
            <Card>
              <CardHeader>
                <CardTitle>Content Management Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Import Content</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Export Data</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
              <h1 className="text-3xl font-bold mb-2">
                Welcome to Teacher Dashboard! 👨‍🏫
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your students' learning journey with AI-powered tools and insights.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg dark:bg-blue-900/20">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Students</p>
                      <p className="text-2xl font-bold">{engagementData.totalStudents}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg dark:bg-green-900/20">
                      <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
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
                    <div className="bg-purple-100 p-2 rounded-lg dark:bg-purple-900/20">
                      <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quizzes</p>
                      <p className="text-2xl font-bold">24</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-lg dark:bg-orange-900/20">
                      <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Today</p>
                      <p className="text-2xl font-bold">{engagementData.activeStudents}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSectionChange('content')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PlusCircle className="h-5 w-5 text-primary" />
                    <span>{t('teacher.createFlashcards')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Create flashcards and learning materials for your students to study with.
                  </p>
                  <Badge variant="secondary">Content Creation</Badge>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSectionChange('engagement')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <span>{t('teacher.studentEngagement')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Track student progress, engagement metrics, and identify areas for improvement.
                  </p>
                  <Badge variant="secondary">Analytics</Badge>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSectionChange('manage')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <span>{t('teacher.manageQuizzes')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Create and manage quizzes, track performance, and analyze student understanding.
                  </p>
                  <Badge variant="secondary">Assessment Tools</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />
      <Navbar />
      
      <div className="flex">
        <Sidebar userRole="teacher" />
        
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Navigation Tabs */}
            <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg w-fit">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpen },
                { id: 'content', label: 'Create Content', icon: PlusCircle },
                { id: 'engagement', label: 'Student Insights', icon: BarChart3 },
                { id: 'manage', label: 'Manage Quizzes', icon: Brain }
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
