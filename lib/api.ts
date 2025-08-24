// API wrapper functions for EduBridge backend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Generic API error handling
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'APIError'
  }
}

// Configuration - SKIP health check by default to avoid fetch errors
const ENABLE_BACKEND_CHECK = process.env.NEXT_PUBLIC_ENABLE_BACKEND_CHECK === 'true'
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false' // Default to mock data

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Default to mock data unless explicitly configured otherwise
  if (USE_MOCK_DATA) {
    console.log(`🎭 Using mock data for ${endpoint} (default behavior)`)
    return Promise.resolve(getMockData(endpoint) as T)
  }

  // Only check backend if explicitly enabled
  if (ENABLE_BACKEND_CHECK) {
    console.log(`🔍 Checking backend availability for ${endpoint}...`)
    const isBackendAvailable = await checkBackendHealth()

    if (!isBackendAvailable) {
      console.log(`❌ Backend not available, using mock data for ${endpoint}`)
      return Promise.resolve(getMockData(endpoint) as T)
    }
    console.log(`✅ Backend available, making real API call to ${endpoint}`)
  } else {
    console.log(`⚡ Backend check disabled, using mock data for ${endpoint}`)
    return Promise.resolve(getMockData(endpoint) as T)
  }

  const url = `${API_BASE_URL}${endpoint}`

  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

    const defaultHeaders: HeadersInit = {}

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json'
    }

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`
    }

    // Add timeout for fetch requests to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, 5000) // 5 second timeout

    let response: Response

    try {
      response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new APIError(response.status, `API Error: ${response.statusText}`)
      }

      return await response.json()

    } catch (fetchError) {
      clearTimeout(timeoutId)

      // Handle different types of errors
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          console.warn(`Request to ${endpoint} timed out after 5 seconds`)
        } else if (fetchError.message.includes('fetch')) {
          console.warn(`Network error for ${endpoint}: ${fetchError.message}`)
        } else {
          console.warn(`API call failed for ${endpoint}: ${fetchError.message}`)
        }
      } else {
        console.warn(`Unknown error for ${endpoint}:`, fetchError)
      }

      throw fetchError // Re-throw to be caught by outer catch
    }

  } catch (error) {
    // Final fallback - always return mock data for any error
    console.warn(`Falling back to mock data for ${endpoint}`)
    return getMockData(endpoint) as T
  }
}

// Check if backend is available
async function checkBackendHealth(): Promise<boolean> {
  try {
    // Simple fetch with built-in timeout using Promise.race
    const fetchPromise = fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      cache: 'no-cache'
    })

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Health check timeout')), 2000)
    })

    const response = await Promise.race([fetchPromise, timeoutPromise])
    return response.ok

  } catch (error) {
    // Backend not available - this is expected during development
    return false
  }
}

// Mock data for offline/development mode
function getMockData(endpoint: string): any {
  const mockResponses: Record<string, any> = {
    '/api/ai-tutor': {
      answer: "I'm here to help you learn! This is a mock response since the backend is not connected yet. Ask me about any subject and I'll do my best to assist you.",
      confidence: 0.9
    },
    '/api/ocr': {
      flashcards: [
        {
          question: 'What is photosynthesis?',
          answer: 'The process by which plants use sunlight to synthesize foods with carbon dioxide and water.'
        },
        {
          question: 'Solve: 2x + 5 = 13',
          answer: 'x = 4 (subtract 5 from both sides, then divide by 2)'
        }
      ],
      knowledge_map: {
        graphs: [
          {
            nodes: [
              {
                id: "photosynthesis",
                label: "Photosynthesis"
              },
              {
                id: "sunlight",
                label: "Sunlight"
              },
              {
                id: "carbon_dioxide",
                label: "Carbon Dioxide"
              },
              {
                id: "water",
                label: "Water"
              },
              {
                id: "glucose",
                label: "Glucose"
              }
            ],
            edges: [
              {
                from: "sunlight",
                to: "photosynthesis"
              },
              {
                from: "carbon_dioxide",
                to: "photosynthesis"
              },
              {
                from: "water",
                to: "photosynthesis"
              },
              {
                from: "photosynthesis",
                to: "glucose"
              }
            ]
          },
          {
            nodes: [
              {
                id: "equation",
                label: "2x + 5 = 13"
              },
              {
                id: "subtract",
                label: "Subtract 5"
              },
              {
                id: "divide",
                label: "Divide by 2"
              },
              {
                id: "solution",
                label: "x = 4"
              }
            ],
            edges: [
              {
                from: "equation",
                to: "subtract"
              },
              {
                from: "subtract",
                to: "divide"
              },
              {
                from: "divide",
                to: "solution"
              }
            ]
          }
        ]
      }
    },
    '/api/wellness': {
      stressLevel: 'medium',
      suggestion: 'Consider taking a 10-minute break and doing some deep breathing exercises. Remember to stay hydrated!',
      wellnessScore: 75
    },
    '/api/quiz': {
      quizzes: [
        {
          id: '1',
          title: 'Basic Mathematics',
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
            }
          ]
        }
      ]
    }
  }

  return mockResponses[endpoint] || { message: 'Mock data not available' }
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string, role: 'student' | 'teacher') => {
    // Mock login - in production, this would validate with backend
    const mockToken = `mock_token_${role}_${Date.now()}`
    localStorage.setItem('auth_token', mockToken)
    localStorage.setItem('user_role', role)
    localStorage.setItem('user_email', email)

    return {
      token: mockToken,
      user: { email, role, id: `user_${Date.now()}` }
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_email')
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('auth_token')
    const role = localStorage.getItem('user_role')
    const email = localStorage.getItem('user_email')

    if (token && role && email) {
      return { token, role, email }
    }
    return null
  }
}

// AI Tutor API
export const aiTutorAPI = {
  askQuestion: async (question: string): Promise<{ answer: string; confidence: number }> => {
    return apiRequest('/api/ai-tutor', {
      method: 'POST',
      body: JSON.stringify({ question })
    })
  }
}

// Types for knowledge map
interface KnowledgeMapNode {
  id: string
  label: string
}

interface KnowledgeMapEdge {
  from: string
  to: string
  label?: string
}

interface KnowledgeMapGraph {
  nodes: KnowledgeMapNode[]
  edges: KnowledgeMapEdge[]
}

interface KnowledgeMapData {
  graphs: KnowledgeMapGraph[]
}

// OCR API for handwritten notes to flashcards and knowledge maps
export const ocrAPI = {
  processImage: async (imageFile: File): Promise<{
    flashcards: Array<{ question: string; answer: string }>
    knowledge_map: KnowledgeMapData
  }> => {
    console.log('🖼️ Processing image:', imageFile.name, 'Size:', Math.round(imageFile.size / 1024), 'KB')

    // Check if we should use mock data
    if (USE_MOCK_DATA) {
      console.log('🎭 Using mock data (configured), skipping backend entirely')
      return getMockData('/api/ocr') as any
    }

    // Always check backend availability
    console.log('🔍 Checking backend connection...')
    const backendAvailable = await checkBackendHealth()

    if (!backendAvailable) {
      console.log('🔌 Backend not available at', API_BASE_URL, '- using mock data as fallback')
      return getMockData('/api/ocr') as any
    }

    console.log('✅ Backend available at', API_BASE_URL, '- proceeding with real processing')

    try {
      const formData = new FormData()
      formData.append('file', imageFile) // Backend expects 'file', not 'image'

      // Try the backend API (apiRequest handles fallback automatically)
      const response = await apiRequest('/api/ocr', {
        method: 'POST',
        body: formData
      })

      // Transform backend response to expected frontend format
      if (response && typeof response === 'object' && 'content' in response) {
        console.log('✅ Got backend response, transforming...')
        return transformBackendResponse(response as any)
      }

      console.log('📝 Using response as-is (likely mock data)')
      return response as any

    } catch (error) {
      console.warn('❌ OCR processing failed, using mock data:', error)
      return getMockData('/api/ocr') as any
    }
  }
}

// Transform backend response to frontend format (supports both OCR-only and Groq-enhanced)
function transformBackendResponse(backendResponse: any): {
  flashcards: Array<{ question: string; answer: string }>
  knowledge_map: KnowledgeMapData
  summary?: string
  key_concepts?: string[]
  study_questions?: string[]
  difficulty_level?: string
  estimated_study_time?: string
  groq_enhanced?: boolean
} {
  // Check if response is Groq-enhanced
  if (backendResponse.groq_enhanced && backendResponse.flashcards) {
    console.log('🤖 Processing Groq-enhanced response')

    // Transform Groq-enhanced response
    const result = {
      flashcards: backendResponse.flashcards.map((card: any) => ({
        question: card.question,
        answer: card.answer
      })),
      knowledge_map: {
        graphs: backendResponse.knowledge_map?.nodes ? [
          {
            nodes: backendResponse.knowledge_map.nodes.map((node: any) => ({
              id: node.id,
              label: node.label
            })),
            edges: backendResponse.knowledge_map.edges?.map((edge: any) => ({
              from: edge.from,
              to: edge.to,
              label: edge.label
            })) || []
          }
        ] : []
      },
      summary: backendResponse.summary,
      key_concepts: backendResponse.key_concepts,
      study_questions: backendResponse.study_questions,
      difficulty_level: backendResponse.difficulty_level,
      estimated_study_time: backendResponse.estimated_study_time,
      groq_enhanced: true
    }

    return result
  }

  // Fallback: Standard OCR response transformation
  console.log('📄 Processing standard OCR response')
  const content = backendResponse.content || []

  // Extract text content for flashcard generation
  const textItems = content.filter((item: any) => item.type === 'text' || item.type === 'heading')

  // Simple flashcard generation from text content
  const flashcards = textItems.slice(0, 5).map((item: any, index: number) => ({
    question: `What does this note section cover? (Item ${index + 1})`,
    answer: item.text || 'No text extracted'
  }))

  // Extract diagram information for knowledge map
  const diagrams = content.filter((item: any) => item.type === 'diagram')

  const knowledge_map: KnowledgeMapData = {
    graphs: diagrams.map((diagram: any, index: number) => ({
      nodes: [
        { id: `topic_${index}`, label: backendResponse.topic || 'Main Topic' },
        { id: `content_${index}`, label: diagram.title || 'Diagram Content' }
      ],
      edges: [
        { from: `topic_${index}`, to: `content_${index}` }
      ]
    }))
  }

  return {
    flashcards,
    knowledge_map,
    groq_enhanced: false
  }
}

// Wellness Check API
export const wellnessAPI = {
  checkWellness: async (text: string): Promise<{ stressLevel: string; suggestion: string; wellnessScore: number }> => {
    return apiRequest('/api/wellness', {
      method: 'POST',
      body: JSON.stringify({ text })
    })
  }
}

// Quiz API
export const quizAPI = {
  getQuizzes: async (): Promise<{ quizzes: Array<any> }> => {
    return apiRequest('/api/quiz')
  },

  submitQuiz: async (quizId: string, answers: Record<string, number>): Promise<{ score: number; totalQuestions: number }> => {
    return apiRequest('/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ quizId, answers })
    })
  }
}

// Teacher API
export const teacherAPI = {
  uploadFlashcards: async (flashcards: Array<{ question: string; answer: string; subject: string }>): Promise<{ success: boolean }> => {
    return apiRequest('/api/teacher/flashcards', {
      method: 'POST',
      body: JSON.stringify({ flashcards })
    })
  },

  getStudentEngagement: async (): Promise<{ engagement: Array<any> }> => {
    return apiRequest('/api/teacher/engagement')
  }
}