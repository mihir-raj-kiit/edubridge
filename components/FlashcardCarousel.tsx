'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, Eye, EyeOff, BookOpen, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { flashcardStorage, type FlashCard } from '@/lib/storage'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface FlashcardCarouselProps {
  className?: string
  flashcards?: FlashCard[]
  title?: string
}

export default function FlashcardCarousel({ 
  className, 
  flashcards: propFlashcards,
  title = "My Flashcards"
}: FlashcardCarouselProps) {
  const [flashcards, setFlashcards] = useState<FlashCard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showingAnswer, setShowingAnswer] = useState(false)

  // Load flashcards from props or storage
  useEffect(() => {
    if (propFlashcards) {
      setFlashcards(propFlashcards)
    } else {
      const savedFlashcards = flashcardStorage.getAll()
      setFlashcards(savedFlashcards)
    }
  }, [propFlashcards])

  // Reset when flashcards change
  useEffect(() => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setShowingAnswer(false)
  }, [flashcards])

  const currentCard = flashcards[currentIndex]

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setShowingAnswer(false)
    }
  }

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
      setShowingAnswer(false)
    }
  }

  const flipCard = () => {
    setIsFlipped(!isFlipped)
    setShowingAnswer(!showingAnswer)
    
    // Mark card as reviewed
    if (currentCard && !showingAnswer) {
      flashcardStorage.updateReviewDate(currentCard.id)
    }
  }

  const resetCarousel = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setShowingAnswer(false)
  }

  if (flashcards.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No flashcards available
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Upload some handwritten notes or create flashcards to start studying!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>{title}</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {currentIndex + 1} of {flashcards.length}
            </Badge>
            {flashcards.length > 1 && (
              <Button variant="outline" size="sm" onClick={resetCarousel}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Flashcard */}
        <div className="relative">
          <div 
            className={cn(
              "min-h-[200px] w-full rounded-lg border-2 border-dashed transition-all duration-300 cursor-pointer",
              isFlipped ? "border-primary bg-primary/5" : "border-muted-foreground/25 bg-background",
              "hover:border-primary/50"
            )}
            onClick={flipCard}
          >
            <div className="p-6 h-full flex flex-col justify-center">
              {/* Subject Badge */}
              {currentCard.subject && (
                <Badge 
                  variant="outline" 
                  className="self-start mb-4 text-xs"
                >
                  {currentCard.subject}
                </Badge>
              )}

              {/* Card Content */}
              <div className="flex-1 flex items-center justify-center text-center">
                <div className="space-y-3">
                  <div className="text-lg font-medium leading-relaxed">
                    {showingAnswer ? currentCard.answer : currentCard.question}
                  </div>
                  
                  {!showingAnswer && (
                    <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>Click to reveal answer</span>
                    </div>
                  )}
                  
                  {showingAnswer && (
                    <div className="flex items-center justify-center space-x-1 text-sm text-primary">
                      <EyeOff className="h-4 w-4" />
                      <span>Answer revealed</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Last Reviewed */}
              {currentCard.lastReviewed && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-4">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Last reviewed: {new Date(currentCard.lastReviewed).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        {flashcards.length > 1 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevCard}
              disabled={currentIndex === 0}
              className="flex items-center space-x-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            {/* Progress Dots */}
            <div className="flex space-x-1">
              {flashcards.slice(0, 10).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index)
                    setIsFlipped(false)
                    setShowingAnswer(false)
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentIndex 
                      ? "bg-primary" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
              {flashcards.length > 10 && (
                <span className="text-xs text-muted-foreground px-1">
                  +{flashcards.length - 10}
                </span>
              )}
            </div>

            <Button
              variant="outline"
              onClick={nextCard}
              disabled={currentIndex === flashcards.length - 1}
              className="flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Study Tips */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <div className="font-medium mb-1">Study Tips:</div>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Try to answer before flipping the card</li>
            <li>Review cards you find difficult more often</li>
            <li>Use spaced repetition for better retention</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
