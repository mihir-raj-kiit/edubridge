// Internationalization utility for EduBridge multilingual support

export type Language = 'en' | 'hi' | 'or' // English, Hindi, Odia

export interface Translations {
  [key: string]: string | Translations
}

// Translation dictionaries
const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      teacher: 'Teacher Portal',
      settings: 'Settings',
      logout: 'Logout',
      login: 'Login'
    },
    
    // Authentication
    auth: {
      email: 'Email',
      password: 'Password',
      role: 'Role',
      student: 'Student',
      teacher: 'Teacher',
      loginButton: 'Login to EduBridge',
      welcome: 'Welcome to EduBridge',
      subtitle: 'AI-powered learning for everyone'
    },

    // Dashboard
    dashboard: {
      welcome: 'Welcome back',
      aiTutor: 'AI Tutor',
      uploadNotes: 'Upload Notes',
      myQuizzes: 'My Quizzes',
      wellnessCheck: 'Wellness Check',
      askQuestion: 'Ask me anything...',
      send: 'Send',
      processing: 'Processing...'
    },

    // Features
    features: {
      uploadFile: 'Upload handwritten notes',
      dragDrop: 'Drag and drop your image here, or click to select',
      generating: 'Generating flashcards...',
      wellnessPrompt: 'How are you feeling today?',
      checkWellness: 'Check My Wellness',
      stressLevel: 'Stress Level',
      suggestion: 'Suggestion'
    },

    // Teacher
    teacher: {
      dashboard: 'Teacher Dashboard',
      uploadContent: 'Upload Content',
      studentEngagement: 'Student Engagement',
      createFlashcards: 'Create Flashcards',
      manageQuizzes: 'Manage Quizzes'
    },

    // Settings
    settings: {
      language: 'Language',
      theme: 'Theme',
      profile: 'Profile',
      preferences: 'Preferences',
      light: 'Light',
      dark: 'Dark',
      system: 'System'
    },

    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      offline: 'You are offline',
      reconnecting: 'Reconnecting...'
    }
  },

  hi: {
    // Navigation
    nav: {
      dashboard: 'डैशबोर्ड',
      teacher: 'शिक्षक पोर्टल',
      settings: 'सेटिंग्स',
      logout: 'लॉग आउट',
      login: 'लॉगिन'
    },
    
    // Authentication
    auth: {
      email: 'ईमेल',
      password: 'पासवर्ड',
      role: 'भूमिका',
      student: 'छात्र',
      teacher: 'शिक्षक',
      loginButton: 'एडुब्रिज में लॉगिन करें',
      welcome: 'एडुब्रिज में आपका स्वागत है',
      subtitle: 'सभी के लिए AI-संचालित शिक्षा'
    },

    // Dashboard
    dashboard: {
      welcome: 'वापसी पर स्वागत है',
      aiTutor: 'AI शिक्���क',
      uploadNotes: 'नोट्स अपलोड करें',
      myQuizzes: 'मेरी क्विज़',
      wellnessCheck: 'कल्याण जाँच',
      askQuestion: 'मुझसे कुछ भी पूछें...',
      send: 'भेजें',
      processing: 'प्रसंस्करण...'
    },

    // Features
    features: {
      uploadFile: 'हस्तलिखित नोट्स अपलोड करें',
      dragDrop: 'अपनी छवि यहाँ ड्रैग करें, या चुनने के लिए क्लिक करें',
      generating: 'फ्लैशकार्ड बना रहे हैं...',
      wellnessPrompt: 'आज आप कैसा महसूस कर रहे हैं?',
      checkWellness: 'मेरी भलाई की जाँच करें',
      stressLevel: 'तनाव स्तर',
      suggestion: 'सुझाव'
    },

    // Teacher
    teacher: {
      dashboard: 'शिक्षक डैशबोर्ड',
      uploadContent: 'सामग्री अपलोड करें',
      studentEngagement: 'छात्र सहभागिता',
      createFlashcards: 'फ्लैशकार्ड बनाएं',
      manageQuizzes: 'क्विज़ प्रबंधित करें'
    },

    // Settings
    settings: {
      language: 'भाषा',
      theme: 'थीम',
      profile: 'प्रोफ़ाइल',
      preferences: 'प्राथमिकताएं',
      light: 'हल्का',
      dark: 'डार्क',
      system: 'सिस्टम'
    },

    // Common
    common: {
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      cancel: 'रद्द करें',
      save: 'सेव करें',
      delete: 'डिलीट करें',
      edit: 'संपादित करें',
      back: 'वापस',
      next: 'अगला',
      previous: 'पिछला',
      offline: 'आप ऑफलाइन हैं',
      reconnecting: 'फिर से कनेक्ट हो रहे हैं...'
    }
  },

  or: {
    // Navigation
    nav: {
      dashboard: 'ଡ୍ୟାସବୋର୍ଡ',
      teacher: 'ଶିକ୍ଷକ ପୋର୍ଟାଲ',
      settings: 'ସେଟିଂସ',
      logout: 'ଲଗ ଆଉଟ',
      login: 'ଲଗିନ'
    },
    
    // Authentication
    auth: {
      email: 'ଇମେଲ',
      password: 'ପାସୱାର୍���',
      role: 'ଭୂମିକା',
      student: 'ଛାତ୍ର',
      teacher: 'ଶିକ୍ଷକ',
      loginButton: 'ଏଡୁବ୍ରିଜରେ ଲଗିନ କରନ୍ତୁ',
      welcome: 'ଏଡୁବ୍ରିଜରେ ସ୍ୱାଗତମ',
      subtitle: 'ସମସ୍ତଙ୍କ ପାଇଁ AI-ଚାଳିତ ଶିକ୍ଷା'
    },

    // Dashboard
    dashboard: {
      welcome: 'ଫେରି ସ୍ୱାଗତମ',
      aiTutor: 'AI ଶିକ୍ଷକ',
      uploadNotes: 'ନୋଟସ ଅପଲୋଡ କରନ୍ତୁ',
      myQuizzes: 'ମୋର କୁଇଜ',
      wellnessCheck: 'କଲ୍ୟାଣ ଯାଞ୍ଚ',
      askQuestion: 'ମୋତେ କିଛି ପଚାରନ୍ତୁ...',
      send: 'ପଠାନ୍ତୁ',
      processing: 'ପ୍ରକ୍ରିୟାକରଣ...'
    },

    // Features
    features: {
      uploadFile: 'ହସ୍ତଲିଖିତ ନୋଟସ ଅପଲୋଡ କରନ୍ତୁ',
      dragDrop: 'ଆପଣଙ୍କ ଛବି ଏଠାରେ ଡ୍ରାଗ କରନ୍ତୁ, କିମ୍ବା ବାଛିବା ପାଇଁ କ୍ଲିକ କରନ୍ତୁ',
      generating: 'ଫ୍ଲାସକାର୍ଡ ତିଆରି କରୁଛି...',
      wellnessPrompt: 'ଆଜି ଆପଣ କେମିତି ଅନ��ଭବ କରୁଛନ୍ତି?',
      checkWellness: 'ମୋର କଲ୍ୟାଣ ଯାଞ୍ଚ କରନ୍ତୁ',
      stressLevel: 'ଚାପ ସ୍ତର',
      suggestion: 'ପରାମର୍ଶ'
    },

    // Teacher
    teacher: {
      dashboard: 'ଶିକ୍ଷକ ଡ୍ୟାସବୋର୍ଡ',
      uploadContent: 'ବିଷୟବସ୍ତୁ ଅପଲୋଡ କରନ୍ତୁ',
      studentEngagement: 'ଛାତ୍ର ସହଭାଗିତା',
      createFlashcards: 'ଫ୍ଲାସକାର୍ଡ ତିଆରି କରନ୍ତୁ',
      manageQuizzes: 'କୁଇଜ ପରିଚାଳନା କରନ୍ତୁ'
    },

    // Settings
    settings: {
      language: 'ଭାଷା',
      theme: 'ଥିମ',
      profile: 'ପ୍ରୋଫାଇଲ',
      preferences: 'ପସନ୍ଦ',
      light: 'ହାଲୁକା',
      dark: 'ଗାଢ଼',
      system: 'ସିଷ୍ଟମ'
    },

    // Common
    common: {
      loading: 'ଲୋଡ ହେଉଛି...',
      error: 'ତ୍ରୁଟି',
      success: 'ସଫଳତା',
      cancel: 'ବାତିଲ କରନ୍ତୁ',
      save: 'ସେଭ କରନ୍ତୁ',
      delete: 'ଡିଲିଟ କରନ୍ତୁ',
      edit: 'ସମ୍ପାଦନା କରନ୍ତୁ',
      back: 'ପଛକୁ',
      next: 'ପରବର୍ତ୍ତୀ',
      previous: 'ପୂର୍ବବର୍ତ୍ତୀ',
      offline: 'ଆପଣ ଅଫଲାଇନରେ ଅଛନ୍ତି',
      reconnecting: 'ପୁନଃ ସଂଯୋଗ କରୁଛି...'
    }
  }
}

// Current language state (would be managed by context in a real app)
let currentLanguage: Language = 'en'

// Get current language from localStorage or default to English
export function getCurrentLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('edubridge_language') as Language
    if (stored && translations[stored]) {
      currentLanguage = stored
      return stored
    }
  }
  return currentLanguage
}

// Set current language and save to localStorage
export function setLanguage(lang: Language): void {
  currentLanguage = lang
  if (typeof window !== 'undefined') {
    localStorage.setItem('edubridge_language', lang)
  }
}

// Get translation for a key with dot notation (e.g., 'auth.email')
export function t(key: string, fallback?: string): string {
  const lang = getCurrentLanguage()
  const keys = key.split('.')
  let value: any = translations[lang]
  
  for (const k of keys) {
    value = value?.[k]
    if (value === undefined) break
  }
  
  if (typeof value === 'string') {
    return value
  }
  
  // Fallback to English if translation not found
  if (lang !== 'en') {
    let englishValue: any = translations.en
    for (const k of keys) {
      englishValue = englishValue?.[k]
      if (englishValue === undefined) break
    }
    if (typeof englishValue === 'string') {
      return englishValue
    }
  }
  
  return fallback || key
}

// Get language display name
export function getLanguageName(lang: Language): string {
  const names: Record<Language, string> = {
    en: 'English',
    hi: 'हिंदी',
    or: 'ଓଡ଼ିଆ'
  }
  return names[lang] || lang
}

// Get all available languages
export function getAvailableLanguages(): Array<{ code: Language; name: string }> {
  return [
    { code: 'en', name: getLanguageName('en') },
    { code: 'hi', name: getLanguageName('hi') },
    { code: 'or', name: getLanguageName('or') }
  ]
}

// Format text with interpolation (basic implementation)
export function tf(key: string, params: Record<string, string | number>): string {
  let text = t(key)
  Object.entries(params).forEach(([param, value]) => {
    text = text.replace(`{{${param}}}`, String(value))
  })
  return text
}
