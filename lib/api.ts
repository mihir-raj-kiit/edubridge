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
  const url = `${API_BASE_URL}${endpoint}`
  const token = localStorage.getItem('auth_token')
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new APIError(response.status, `API Error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    // Network error or other issues - return mock data for development
    console.warn(`API call failed: ${endpoint}. Using mock data.`)
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
          id: '1',
          front: 'What is photosynthesis?',
          back: 'The process by which plants use sunlight to synthesize foods with carbon dioxide and water.',
          subject: 'Biology'
        },
        {
          id: '2', 
          front: 'Solve: 2x + 5 = 13',
          back: 'x = 4 (subtract 5 from both sides, then divide by 2)',
          subject: 'Mathematics'
        }
      ]
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

// OCR API for handwritten notes to flashcards
export const ocrAPI = {
  processImage: async (imageFile: File): Promise<{ flashcards: Array<{ id: string; front: string; back: string; subject: string }> }> => {
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
  uploadFlashcards: async (flashcards: Array<{ front: string; back: string; subject: string }>): Promise<{ success: boolean }> => {
    return apiRequest('/api/teacher/flashcards', {
      method: 'POST',
      body: JSON.stringify({ flashcards })
    })
  },

  getStudentEngagement: async (): Promise<{ engagement: Array<any> }> => {
    return apiRequest('/api/teacher/engagement')
  }
}
