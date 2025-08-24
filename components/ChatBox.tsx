'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { aiTutorAPI } from '@/lib/api'
import { chatStorage, type ChatMessage } from '@/lib/storage'
import { t } from '@/lib/i18n'
import { cn, generateId } from '@/lib/utils'

interface ChatBoxProps {
  className?: string
}

export default function ChatBox({ className }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load chat history from storage on mount
  useEffect(() => {
    const savedMessages = chatStorage.getAll()
    setMessages(savedMessages)
  }, [])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message])
    chatStorage.add(message)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: generateId(),
      message: inputValue.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    }

    // Add user message
    addMessage(userMessage)
    setInputValue('')
    setIsLoading(true)

    try {
      // Get AI response
      const response = await aiTutorAPI.askQuestion(userMessage.message)
      
      const aiMessage: ChatMessage = {
        id: generateId(),
        message: response.answer,
        sender: 'ai',
        timestamp: new Date().toISOString()
      }

      addMessage(aiMessage)
    } catch (error) {
      console.error('Error getting AI response:', error)
      
      const errorMessage: ChatMessage = {
        id: generateId(),
        message: "I'm sorry, I'm having trouble connecting right now. Please try again later. In the meantime, you can review your saved flashcards or take a quiz!",
        sender: 'ai',
        timestamp: new Date().toISOString()
      }

      addMessage(errorMessage)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    chatStorage.clear()
  }

  return (
    <Card className={cn("flex flex-col h-96", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Bot className="h-5 w-5 text-primary" />
            <span>{t('dashboard.aiTutor')}</span>
          </CardTitle>
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="text-xs"
            >
              Clear Chat
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm">
                Hi! I'm your AI tutor. Ask me anything about your studies!
              </p>
              <p className="text-xs mt-1 opacity-75">
                Try: "Explain photosynthesis" or "Help me solve 2x + 5 = 13"
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start space-x-2",
                  message.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.sender === 'ai' && (
                  <div className="bg-primary rounded-full p-1.5 mt-1">
                    <Bot className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                
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

                {message.sender === 'user' && (
                  <div className="bg-muted rounded-full p-1.5 mt-1">
                    <User className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start space-x-2">
              <div className="bg-primary rounded-full p-1.5 mt-1">
                <Bot className="h-3 w-3 text-primary-foreground" />
              </div>
              <div className="chat-bubble-ai flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('dashboard.processing')}</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('dashboard.askQuestion')}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
