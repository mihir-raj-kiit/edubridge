// Groq API utilities for frontend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Enhanced response type from Groq-processed data
export interface GroqEnhancedResponse {
  lecture_id: string
  course: string
  topic: string
  date: string
  content: Array<any>
  
  // Groq AI enhancements
  groq_enhanced: boolean
  flashcards: Array<{
    question: string
    answer: string
    category: string
  }>
  summary: string
  key_concepts: string[]
  study_questions: string[]
  knowledge_map: {
    nodes: Array<{
      id: string
      label: string
      type: string
    }>
    edges: Array<{
      from: string
      to: string
      label: string
    }>
  }
  difficulty_level: string
  estimated_study_time: string
}

export const groqAPI = {
  /**
   * Check if Groq service is available
   */
  async checkHealth(): Promise<{ groq_available: boolean; service_status: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/groq/health`)
      return await response.json()
    } catch (error) {
      console.warn('Groq health check failed:', error)
      return { groq_available: false, service_status: 'error' }
    }
  },

  /**
   * Enhance existing OCR data with Groq AI
   */
  async enhanceOCRData(ocrData: any): Promise<GroqEnhancedResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/groq/enhance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ocrData)
      })

      if (!response.ok) {
        throw new Error(`Groq enhancement failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.warn('Groq enhancement failed, returning original data:', error)
      // Return original data with empty Groq fields
      return {
        ...ocrData,
        groq_enhanced: false,
        flashcards: [],
        summary: '',
        key_concepts: [],
        study_questions: [],
        knowledge_map: { nodes: [], edges: [] },
        difficulty_level: 'intermediate',
        estimated_study_time: '15-20 minutes'
      }
    }
  },

  /**
   * Generate flashcards from text content
   */
  async generateFlashcards(
    textContent: string,
    course: string = 'General Studies',
    topic: string = 'Study Notes',
    numCards: number = 5
  ): Promise<{ flashcards: Array<any>; generated_count: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/groq/generate-flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text_content: textContent,
          course,
          topic,
          num_cards: numCards
        })
      })

      if (!response.ok) {
        throw new Error(`Flashcard generation failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.warn('Flashcard generation failed:', error)
      // Return mock flashcards
      return {
        flashcards: [
          {
            question: `What is the main topic of ${topic}?`,
            answer: `The main concepts covered in ${topic} as part of ${course}.`,
            category: 'comprehension'
          }
        ],
        generated_count: 1
      }
    }
  }
}

/**
 * Transform Groq-enhanced backend response to frontend format
 */
export function transformGroqResponse(backendResponse: GroqEnhancedResponse): {
  flashcards: Array<{ question: string; answer: string }>
  knowledge_map: {
    graphs: Array<{
      nodes: Array<{ id: string; label: string }>
      edges: Array<{ from: string; to: string; label?: string }>
    }>
  }
  summary?: string
  key_concepts?: string[]
  study_questions?: string[]
  difficulty_level?: string
  estimated_study_time?: string
  groq_enhanced?: boolean
} {
  const result = {
    flashcards: backendResponse.flashcards?.map(card => ({
      question: card.question,
      answer: card.answer
    })) || [],
    knowledge_map: {
      graphs: backendResponse.knowledge_map ? [
        {
          nodes: backendResponse.knowledge_map.nodes?.map(node => ({
            id: node.id,
            label: node.label
          })) || [],
          edges: backendResponse.knowledge_map.edges?.map(edge => ({
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
    groq_enhanced: backendResponse.groq_enhanced
  }

  return result
}
