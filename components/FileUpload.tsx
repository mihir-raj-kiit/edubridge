'use client'

import { useState, useRef } from 'react'
import { Upload, Image, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ocrAPI } from '@/lib/api'
import { flashcardStorage, knowledgeMapStorage, type FlashCard, type KnowledgeMap as KnowledgeMapType } from '@/lib/storage'
import { t } from '@/lib/i18n'
import { cn, generateId } from '@/lib/utils'

interface FileUploadProps {
  className?: string
  onFlashcardsGenerated?: (flashcards: FlashCard[]) => void
  onKnowledgeMapGenerated?: (knowledgeMap: KnowledgeMapType) => void
}

export default function FileUpload({ className, onFlashcardsGenerated, onKnowledgeMapGenerated }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxFileSize = 5 * 1024 * 1024 // 5MB

  const validateFile = (file: File): string | null => {
    if (!acceptedFileTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPG, PNG, WEBP)'
    }
    if (file.size > maxFileSize) {
      return 'File size must be less than 5MB'
    }
    return null
  }

  const handleFileSelect = (file: File) => {
    const error = validateFile(file)
    if (error) {
      setStatus('error')
      setStatusMessage(error)
      return
    }

    setUploadedFile(file)
    setStatus('idle')
    setStatusMessage('')

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const processImage = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    setStatus('idle')

    try {
      const response = await ocrAPI.processImage(uploadedFile)

      // Convert API response to FlashCard format
      const flashcards: FlashCard[] = response.flashcards.map(card => ({
        id: generateId(),
        question: card.question,
        answer: card.answer,
        subject: 'General',
        createdAt: new Date().toISOString()
      }))

      // Save flashcards to local storage
      flashcardStorage.addMany(flashcards)

      // Process knowledge map if available
      if (response.knowledge_map && response.knowledge_map.graphs.length > 0) {
        const knowledgeMap: KnowledgeMapType = {
          id: generateId(),
          graphs: response.knowledge_map.graphs,
          subject: flashcards.length > 0 ? (flashcards[0].subject || 'General') : 'General',
          createdAt: new Date().toISOString()
        }

        // Save knowledge map to local storage
        knowledgeMapStorage.add(knowledgeMap)

        // Notify parent component
        onKnowledgeMapGenerated?.(knowledgeMap)
      }

      setStatus('success')
      setStatusMessage(`Generated ${flashcards.length} flashcards${response.knowledge_map ? ' and knowledge map' : ''} successfully!`)

      // Notify parent component about flashcards
      onFlashcardsGenerated?.(flashcards)

      // Reset after success
      setTimeout(() => {
        resetUpload()
      }, 3000)

    } catch (error) {
      console.error('Error processing image:', error)
      setStatus('error')
      setStatusMessage('Failed to process image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setPreviewUrl(null)
    setStatus('idle')
    setStatusMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <span>{t('features.uploadFile')}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            isDragOver 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            status === 'error' && "border-destructive bg-destructive/5"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFileTypes.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />

          {previewUrl ? (
            <div className="space-y-4">
              <img
                src={previewUrl}
                alt="Upload preview"
                className="max-w-full max-h-48 mx-auto rounded-lg object-contain"
              />
              <div className="text-sm text-muted-foreground">
                {uploadedFile?.name}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                {isDragOver ? (
                  <Upload className="h-6 w-6 text-primary" />
                ) : (
                  <Image className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {t('features.dragDrop')}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports JPG, PNG, WEBP up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={cn(
            "flex items-center space-x-2 p-3 rounded-lg text-sm",
            status === 'success' && "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400",
            status === 'error' && "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
          )}>
            {status === 'success' && <CheckCircle className="h-4 w-4" />}
            {status === 'error' && <AlertCircle className="h-4 w-4" />}
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {uploadedFile && (
            <Button
              onClick={processImage}
              disabled={isProcessing}
              className="flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('features.generating')}</span>
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  <span>Generate Flashcards</span>
                </>
              )}
            </Button>
          )}
          
          {uploadedFile && !isProcessing && (
            <Button variant="outline" onClick={resetUpload}>
              Upload Different Image
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 p-3 rounded-lg">
          <div className="font-medium">Tips for best results:</div>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Ensure text is clearly visible and well-lit</li>
            <li>Avoid shadows and glare on the paper</li>
            <li>Include diagrams or key concepts you want to study</li>
            <li>Handwriting should be legible for better OCR accuracy</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
