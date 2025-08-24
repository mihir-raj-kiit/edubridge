'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Clock, Trophy, Brain, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { quizAPI } from '@/lib/api'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface Question {
  id: string
  question: string
  options: string[]
  correct: number
}

interface Quiz {
  id: string
  title: string
  questions: Question[]
}

interface QuizCardProps {
  quiz: Quiz
  className?: string
  onComplete?: (score: number, totalQuestions: number) => void
}

export default function QuizCard({ quiz, className, onComplete }: QuizCardProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1
  const selectedAnswer = selectedAnswers[currentQuestion?.id]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  const startQuiz = () => {
    setQuizStarted(true)
    setStartTime(new Date())
  }

  const selectAnswer = (optionIndex: number) => {
    if (showResults) return
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }))
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const submitQuiz = async () => {
    setIsSubmitting(true)
    setEndTime(new Date())

    try {
      const response = await quizAPI.submitQuiz(quiz.id, selectedAnswers)
      setShowResults(true)
      onComplete?.(response.score, response.totalQuestions)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      // Calculate score locally if API fails
      const correctAnswers = quiz.questions.filter(
        q => selectedAnswers[q.id] === q.correct
      ).length
      setShowResults(true)
      onComplete?.(correctAnswers, quiz.questions.length)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setShowResults(false)
    setQuizStarted(false)
    setStartTime(null)
    setEndTime(null)
  }

  const calculateScore = () => {
    return quiz.questions.filter(
      q => selectedAnswers[q.id] === q.correct
    ).length
  }

  const getTimeTaken = () => {
    if (!startTime || !endTime) return null
    const timeDiff = endTime.getTime() - startTime.getTime()
    const minutes = Math.floor(timeDiff / 60000)
    const seconds = Math.floor((timeDiff % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Pre-start screen
  if (!quizStarted) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>{quiz.title}</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <Badge variant="secondary" className="text-sm">
                {quiz.questions.length} Questions
              </Badge>
              <p className="text-muted-foreground">
                Test your knowledge with this interactive quiz
              </p>
            </div>
            
            <Button onClick={startQuiz} className="w-full">
              Start Quiz
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <div className="font-medium mb-1">Instructions:</div>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Read each question carefully</li>
              <li>Select the best answer from the options</li>
              <li>You can navigate back to previous questions</li>
              <li>Submit when you're ready to see your results</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Results screen
  if (showResults) {
    const score = calculateScore()
    const percentage = Math.round((score / quiz.questions.length) * 100)
    const timeTaken = getTimeTaken()

    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span>Quiz Results</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Score Summary */}
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                {percentage}%
              </div>
              <div className="text-lg text-muted-foreground">
                {score} out of {quiz.questions.length} correct
              </div>
              {timeTaken && (
                <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Completed in {timeTaken}</span>
                </div>
              )}
            </div>
            
            <Badge 
              variant={percentage >= 80 ? "default" : percentage >= 60 ? "secondary" : "destructive"}
              className="text-sm"
            >
              {percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good Job!" : "Keep Practicing!"}
            </Badge>
          </div>

          {/* Question Review */}
          <div className="space-y-3">
            <h4 className="font-medium">Review Your Answers:</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {quiz.questions.map((question, index) => {
                const userAnswer = selectedAnswers[question.id]
                const isCorrect = userAnswer === question.correct
                
                return (
                  <div 
                    key={question.id}
                    className={cn(
                      "p-3 rounded-lg border text-sm",
                      isCorrect 
                        ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                        : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                    )}
                  >
                    <div className="flex items-start space-x-2">
                      {isCorrect ? (
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">
                          {index + 1}. {question.question}
                        </div>
                        <div className={cn(
                          "text-xs",
                          isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                        )}>
                          Your answer: {question.options[userAnswer]}
                          {!isCorrect && (
                            <div className="mt-1 text-green-700 dark:text-green-400">
                              Correct: {question.options[question.correct]}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <Button onClick={resetQuiz} variant="outline" className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Quiz
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Quiz in progress
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{quiz.title}</CardTitle>
            <Badge variant="secondary">
              {currentQuestionIndex + 1} / {quiz.questions.length}
            </Badge>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium leading-relaxed">
            {currentQuestion.question}
          </h3>
          
          {/* Options */}
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => selectAnswer(index)}
                className={cn(
                  "w-full p-3 text-left rounded-lg border transition-colors",
                  selectedAnswer === index
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-muted-foreground hover:bg-accent"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium",
                    selectedAnswer === index
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground"
                  )}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          
          <div className="flex space-x-2">
            {!isLastQuestion ? (
              <Button
                onClick={nextQuestion}
                disabled={selectedAnswer === undefined}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={submitQuiz}
                disabled={selectedAnswer === undefined || isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
