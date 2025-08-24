// Local storage utilities for EduBridge offline functionality

export interface FlashCard {
  id: string
  question: string
  answer: string
  subject?: string
  createdAt: string
  lastReviewed?: string
}

export interface Quiz {
  id: string
  title: string
  questions: Array<{
    id: string
    question: string
    options: string[]
    correct: number
  }>
  createdAt: string
}

export interface WellnessRecord {
  id: string
  text: string
  stressLevel: string
  suggestion: string
  wellnessScore: number
  timestamp: string
}

export interface KnowledgeMapNode {
  id: string
  label: string
}

export interface KnowledgeMapEdge {
  from: string
  to: string
  label?: string
}

export interface KnowledgeMapGraph {
  nodes: KnowledgeMapNode[]
  edges: KnowledgeMapEdge[]
}

export interface KnowledgeMap {
  id: string
  graphs: KnowledgeMapGraph[]
  subject: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  message: string
  sender: 'user' | 'ai'
  timestamp: string
}

export interface OfflineData {
  flashcards: FlashCard[]
  quizzes: Quiz[]
  wellnessRecords: WellnessRecord[]
  chatHistory: ChatMessage[]
  knowledgeMaps: KnowledgeMap[]
  lastSync: string
}

// Storage keys
const STORAGE_KEYS = {
  FLASHCARDS: 'edubridge_flashcards',
  QUIZZES: 'edubridge_quizzes',
  WELLNESS_RECORDS: 'edubridge_wellness',
  CHAT_HISTORY: 'edubridge_chat',
  KNOWLEDGE_MAPS: 'edubridge_knowledge_maps',
  LAST_SYNC: 'edubridge_last_sync',
  USER_PREFERENCES: 'edubridge_preferences',
  OFFLINE_MODE: 'edubridge_offline_mode'
} as const

// Check if localStorage is available
function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false
    const test = '__test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

// Generic storage functions
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (!isStorageAvailable()) return defaultValue
  
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.warn(`Error reading from localStorage for key ${key}:`, error)
    return defaultValue
  }
}

function setToStorage<T>(key: string, value: T): boolean {
  if (!isStorageAvailable()) return false
  
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.warn(`Error writing to localStorage for key ${key}:`, error)
    return false
  }
}

// Flashcards storage
export const flashcardStorage = {
  getAll: (): FlashCard[] => {
    return getFromStorage(STORAGE_KEYS.FLASHCARDS, [])
  },

  save: (flashcards: FlashCard[]): boolean => {
    return setToStorage(STORAGE_KEYS.FLASHCARDS, flashcards)
  },

  add: (flashcard: FlashCard): boolean => {
    const existing = flashcardStorage.getAll()
    const updated = [...existing, flashcard]
    return flashcardStorage.save(updated)
  },

  addMany: (newFlashcards: FlashCard[]): boolean => {
    const existing = flashcardStorage.getAll()
    const updated = [...existing, ...newFlashcards]
    return flashcardStorage.save(updated)
  },

  remove: (id: string): boolean => {
    const existing = flashcardStorage.getAll()
    const updated = existing.filter(card => card.id !== id)
    return flashcardStorage.save(updated)
  },

  updateReviewDate: (id: string): boolean => {
    const existing = flashcardStorage.getAll()
    const updated = existing.map(card => 
      card.id === id 
        ? { ...card, lastReviewed: new Date().toISOString() }
        : card
    )
    return flashcardStorage.save(updated)
  },

  clear: (): boolean => {
    return setToStorage(STORAGE_KEYS.FLASHCARDS, [])
  }
}

// Knowledge Maps storage
export const knowledgeMapStorage = {
  getAll: (): KnowledgeMap[] => {
    return getFromStorage(STORAGE_KEYS.KNOWLEDGE_MAPS, [])
  },

  save: (knowledgeMaps: KnowledgeMap[]): boolean => {
    return setToStorage(STORAGE_KEYS.KNOWLEDGE_MAPS, knowledgeMaps)
  },

  add: (knowledgeMap: KnowledgeMap): boolean => {
    const existing = knowledgeMapStorage.getAll()
    const updated = [...existing, knowledgeMap]
    return knowledgeMapStorage.save(updated)
  },

  remove: (id: string): boolean => {
    const existing = knowledgeMapStorage.getAll()
    const updated = existing.filter(map => map.id !== id)
    return knowledgeMapStorage.save(updated)
  },

  clear: (): boolean => {
    return setToStorage(STORAGE_KEYS.KNOWLEDGE_MAPS, [])
  }
}

// Quiz storage
export const quizStorage = {
  getAll: (): Quiz[] => {
    return getFromStorage(STORAGE_KEYS.QUIZZES, [])
  },

  save: (quizzes: Quiz[]): boolean => {
    return setToStorage(STORAGE_KEYS.QUIZZES, quizzes)
  },

  add: (quiz: Quiz): boolean => {
    const existing = quizStorage.getAll()
    const updated = [...existing, quiz]
    return quizStorage.save(updated)
  },

  remove: (id: string): boolean => {
    const existing = quizStorage.getAll()
    const updated = existing.filter(quiz => quiz.id !== id)
    return quizStorage.save(updated)
  },

  clear: (): boolean => {
    return setToStorage(STORAGE_KEYS.QUIZZES, [])
  }
}

// Wellness records storage
export const wellnessStorage = {
  getAll: (): WellnessRecord[] => {
    return getFromStorage(STORAGE_KEYS.WELLNESS_RECORDS, [])
  },

  save: (records: WellnessRecord[]): boolean => {
    return setToStorage(STORAGE_KEYS.WELLNESS_RECORDS, records)
  },

  add: (record: WellnessRecord): boolean => {
    const existing = wellnessStorage.getAll()
    const updated = [...existing, record]
    return wellnessStorage.save(updated)
  },

  getLast30Days: (): WellnessRecord[] => {
    const all = wellnessStorage.getAll()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    return all.filter(record => 
      new Date(record.timestamp) >= thirtyDaysAgo
    )
  },

  clear: (): boolean => {
    return setToStorage(STORAGE_KEYS.WELLNESS_RECORDS, [])
  }
}

// Chat history storage
export const chatStorage = {
  getAll: (): ChatMessage[] => {
    return getFromStorage(STORAGE_KEYS.CHAT_HISTORY, [])
  },

  save: (messages: ChatMessage[]): boolean => {
    return setToStorage(STORAGE_KEYS.CHAT_HISTORY, messages)
  },

  add: (message: ChatMessage): boolean => {
    const existing = chatStorage.getAll()
    const updated = [...existing, message]
    
    // Keep only last 100 messages to prevent storage bloat
    const trimmed = updated.slice(-100)
    return chatStorage.save(trimmed)
  },

  clear: (): boolean => {
    return setToStorage(STORAGE_KEYS.CHAT_HISTORY, [])
  }
}

// Sync management
export const syncStorage = {
  getLastSync: (): string | null => {
    return getFromStorage(STORAGE_KEYS.LAST_SYNC, null)
  },

  setLastSync: (timestamp?: string): boolean => {
    const time = timestamp || new Date().toISOString()
    return setToStorage(STORAGE_KEYS.LAST_SYNC, time)
  }
}

// Offline mode management
export const offlineStorage = {
  isOfflineMode: (): boolean => {
    return getFromStorage(STORAGE_KEYS.OFFLINE_MODE, false)
  },

  setOfflineMode: (isOffline: boolean): boolean => {
    return setToStorage(STORAGE_KEYS.OFFLINE_MODE, isOffline)
  }
}

// User preferences
export interface UserPreferences {
  language: string
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
  autoSync: boolean
}

export const preferencesStorage = {
  get: (): UserPreferences => {
    return getFromStorage(STORAGE_KEYS.USER_PREFERENCES, {
      language: 'en',
      theme: 'system',
      notifications: true,
      autoSync: true
    })
  },

  set: (preferences: Partial<UserPreferences>): boolean => {
    const current = preferencesStorage.get()
    const updated = { ...current, ...preferences }
    return setToStorage(STORAGE_KEYS.USER_PREFERENCES, updated)
  }
}

// Bulk operations for data export/import
export const bulkStorage = {
  exportAll: (): OfflineData => {
    return {
      flashcards: flashcardStorage.getAll(),
      quizzes: quizStorage.getAll(),
      wellnessRecords: wellnessStorage.getAll(),
      chatHistory: chatStorage.getAll(),
      knowledgeMaps: knowledgeMapStorage.getAll(),
      lastSync: syncStorage.getLastSync() || ''
    }
  },

  importAll: (data: Partial<OfflineData>): boolean => {
    try {
      if (data.flashcards) flashcardStorage.save(data.flashcards)
      if (data.quizzes) quizStorage.save(data.quizzes)
      if (data.wellnessRecords) wellnessStorage.save(data.wellnessRecords)
      if (data.chatHistory) chatStorage.save(data.chatHistory)
      if (data.knowledgeMaps) knowledgeMapStorage.save(data.knowledgeMaps)
      if (data.lastSync) syncStorage.setLastSync(data.lastSync)

      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  },

  clearAll: (): boolean => {
    try {
      flashcardStorage.clear()
      quizStorage.clear()
      wellnessStorage.clear()
      chatStorage.clear()
      knowledgeMapStorage.clear()

      return true
    } catch (error) {
      console.error('Error clearing data:', error)
      return false
    }
  }
}

// Storage size utilities
export const storageUtils = {
  getUsageBytes: (): number => {
    if (!isStorageAvailable()) return 0
    
    let total = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length
      }
    }
    return total
  },

  getUsageMB: (): number => {
    return Math.round(storageUtils.getUsageBytes() / 1024 / 1024 * 100) / 100
  },

  isQuotaExceeded: (): boolean => {
    // Most browsers have ~5-10MB limit for localStorage
    return storageUtils.getUsageMB() > 4.5 // Leave some buffer
  }
}
