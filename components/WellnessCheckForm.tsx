'use client'

import { useState } from 'react'
import { Heart, Send, Loader2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { wellnessAPI } from '@/lib/api'
import { wellnessStorage, type WellnessRecord } from '@/lib/storage'
import { t } from '@/lib/i18n'
import { cn, generateId } from '@/lib/utils'

interface WellnessCheckFormProps {
  className?: string
}

export default function WellnessCheckForm({ className }: WellnessCheckFormProps) {
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentResult, setCurrentResult] = useState<WellnessRecord | null>(null)
  const [recentChecks, setRecentChecks] = useState<WellnessRecord[]>([])

  // Load recent wellness checks on component mount
  useState(() => {
    const recent = wellnessStorage.getLast30Days()
    setRecentChecks(recent.slice(-5)) // Show last 5 checks
  })

  const handleSubmit = async () => {
    if (!inputText.trim() || isProcessing) return

    setIsProcessing(true)

    try {
      const response = await wellnessAPI.checkWellness(inputText.trim())
      
      const wellnessRecord: WellnessRecord = {
        id: generateId(),
        text: inputText.trim(),
        stressLevel: response.stressLevel,
        suggestion: response.suggestion,
        wellnessScore: response.wellnessScore,
        timestamp: new Date().toISOString()
      }

      // Save to storage
      wellnessStorage.add(wellnessRecord)
      
      // Update state
      setCurrentResult(wellnessRecord)
      setRecentChecks(prev => [...prev.slice(-4), wellnessRecord])
      setInputText('')
      
    } catch (error) {
      console.error('Error checking wellness:', error)
      
      // Provide fallback result
      const fallbackRecord: WellnessRecord = {
        id: generateId(),
        text: inputText.trim(),
        stressLevel: 'unknown',
        suggestion: 'Thank you for sharing. Consider taking regular breaks and staying connected with friends and family.',
        wellnessScore: 50,
        timestamp: new Date().toISOString()
      }
      
      setCurrentResult(fallbackRecord)
      wellnessStorage.add(fallbackRecord)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isProcessing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const getStressLevelInfo = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return {
          color: 'bg-green-500',
          icon: CheckCircle,
          label: 'Low Stress',
          description: 'You seem to be feeling well'
        }
      case 'medium':
        return {
          color: 'bg-yellow-500',
          icon: TrendingUp,
          label: 'Moderate Stress',
          description: 'Some stress detected'
        }
      case 'high':
        return {
          color: 'bg-red-500',
          icon: AlertTriangle,
          label: 'High Stress',
          description: 'Consider taking a break'
        }
      default:
        return {
          color: 'bg-gray-500',
          icon: Heart,
          label: 'Assessment Complete',
          description: 'Thank you for sharing'
        }
    }
  }

  const getWellnessScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Wellness Check Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-primary" />
            <span>{t('dashboard.wellnessCheck')}</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Input Form */}
          <div className="space-y-3">
            <label htmlFor="wellness-input" className="text-sm font-medium">
              {t('features.wellnessPrompt')}
            </label>
            <Textarea
              id="wellness-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share how you're feeling today, any challenges you're facing, or what's on your mind..."
              rows={4}
              disabled={isProcessing}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Press Ctrl+Enter to submit quickly
              </p>
              <span className="text-xs text-muted-foreground">
                {inputText.length}/500
              </span>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!inputText.trim() || isProcessing || inputText.length > 500}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span>Analyzing your wellness...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                <span>{t('features.checkWellness')}</span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Current Result */}
      {currentResult && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Wellness Score and Stress Level */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Wellness Score</div>
                  <div className={cn(
                    "text-2xl font-bold",
                    getWellnessScoreColor(currentResult.wellnessScore)
                  )}>
                    {currentResult.wellnessScore}/100
                  </div>
                </div>
                
                <div className="text-right">
                  {(() => {
                    const stressInfo = getStressLevelInfo(currentResult.stressLevel)
                    const IconComponent = stressInfo.icon
                    return (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4" />
                          <span className="text-sm font-medium">{stressInfo.label}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {stressInfo.description}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Suggestion */}
              <div className="bg-background/50 rounded-lg p-4 space-y-2">
                <div className="text-sm font-medium">Personalized Suggestion:</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentResult.suggestion}
                </p>
              </div>

              {/* Timestamp */}
              <div className="text-xs text-muted-foreground text-center">
                Checked on {new Date(currentResult.timestamp).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Wellness Checks */}
      {recentChecks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Wellness Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentChecks.map((check) => {
                const stressInfo = getStressLevelInfo(check.stressLevel)
                return (
                  <div
                    key={check.id}
                    className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg"
                  >
                    <div className={cn(
                      "w-3 h-3 rounded-full mt-1.5 flex-shrink-0",
                      stressInfo.color
                    )} />
                    
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          Score: {check.wellnessScore}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(check.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {check.text}
                      </p>
                      
                      {check.suggestion && (
                        <p className="text-xs text-muted-foreground/80 italic line-clamp-1">
                          💡 {check.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wellness Tips */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-xs text-muted-foreground space-y-2">
            <div className="font-medium">Wellness Tips:</div>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Take regular breaks while studying (20-minute rule)</li>
              <li>Stay hydrated and maintain good sleep habits</li>
              <li>Connect with friends, family, or counselors when needed</li>
              <li>Practice mindfulness or breathing exercises</li>
              <li>Celebrate small achievements in your learning journey</li>
            </ul>
            <div className="mt-3 text-center italic">
              Remember: Your mental health is just as important as your academic success 💚
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
