// API Debugging Utilities

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiDebug = {
  /**
   * Test backend connectivity manually
   */
  async testBackend(): Promise<{ status: string; details: any }> {
    console.log('🔍 Testing backend connectivity...')
    
    try {
      // Test simple fetch without timeouts
      const response = await fetch(`${API_BASE_URL}/health`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Backend is responsive:', data)
        return { status: 'success', details: data }
      } else {
        console.log('⚠️ Backend responded but not OK:', response.status, response.statusText)
        return { status: 'error', details: { status: response.status, statusText: response.statusText } }
      }
      
    } catch (error) {
      console.log('❌ Backend connection failed:', error)
      return { status: 'failed', details: error instanceof Error ? error.message : error }
    }
  },

  /**
   * Test file upload endpoint
   */
  async testUpload(): Promise<{ status: string; details: any }> {
    console.log('🔍 Testing upload endpoint...')
    
    try {
      // Create a small test file
      const testBlob = new Blob(['test'], { type: 'text/plain' })
      const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' })
      
      const formData = new FormData()
      formData.append('file', testFile)
      
      const response = await fetch(`${API_BASE_URL}/api/ocr`, {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Upload endpoint is working:', data)
        return { status: 'success', details: data }
      } else {
        console.log('⚠️ Upload endpoint error:', response.status, response.statusText)
        const errorText = await response.text()
        return { status: 'error', details: { status: response.status, statusText: response.statusText, body: errorText } }
      }
      
    } catch (error) {
      console.log('❌ Upload test failed:', error)
      return { status: 'failed', details: error instanceof Error ? error.message : error }
    }
  },

  /**
   * Get current API configuration
   */
  getConfig() {
    return {
      apiBaseUrl: API_BASE_URL,
      environment: process.env.NODE_ENV,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }
  },

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 Running comprehensive API tests...')
    
    const config = this.getConfig()
    console.log('📋 Configuration:', config)
    
    const backendTest = await this.testBackend()
    const uploadTest = await this.testUpload()
    
    const results = {
      config,
      tests: {
        backend: backendTest,
        upload: uploadTest
      },
      summary: {
        backendWorking: backendTest.status === 'success',
        uploadWorking: uploadTest.status === 'success',
        overallStatus: (backendTest.status === 'success' && uploadTest.status === 'success') ? 'all_good' : 'issues_detected'
      }
    }
    
    console.log('📊 Test Results:', results)
    return results
  }
}

// Export for global access in development
if (typeof window !== 'undefined') {
  (window as any).apiDebug = apiDebug
}
