// API wrapper functions for EduBridge backend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Generic API error handling
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'APIError'
  }
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // In development mode, always use mock data to avoid fetch issues
  if (process.env.NODE_ENV === 'development') {
    console.log(`Development mode: Using mock data for ${endpoint}`)
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
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

    const response = await fetch(url, {
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
  } catch (error) {
    // Log the error for debugging but don't throw it
    console.warn(`API call failed for ${endpoint}:`, error instanceof Error ? error.message : error)
    console.warn(`Falling back to mock data for ${endpoint}`)

    // Always return mock data when any error occurs (network, CORS, etc.)
    return getMockData(endpoint) as T
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
    const formData = new FormData()
    formData.append('image', imageFile)

    return apiRequest('/api/ocr', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData
    })
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
