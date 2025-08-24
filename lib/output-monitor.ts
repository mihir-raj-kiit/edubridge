// Output file monitoring utilities for Groq AI generated JSON files
import { useState, useEffect } from 'react'

export interface OutputFile {
  filename: string
  timestamp: string
  type: 'ocr' | 'diagram' | 'groq_enhanced' | 'extract'
  groq_enhanced: boolean
  content: any
}

class OutputMonitor {
  private readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  /**
   * List recent output files from backend
   */
  async listOutputFiles(): Promise<OutputFile[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/outputs`)
      if (!response.ok) throw new Error('Failed to fetch output files')
      
      const files = await response.json()
      return files.map((file: any) => ({
        filename: file.filename,
        timestamp: file.timestamp,
        type: this.detectFileType(file.filename),
        groq_enhanced: file.filename.includes('groq'),
        content: file.content
      }))
    } catch (error) {
      console.warn('Could not fetch output files:', error)
      return []
    }
  }

  /**
   * Get specific output file content
   */
  async getOutputFile(filename: string): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/outputs/${filename}`)
      if (!response.ok) throw new Error(`File not found: ${filename}`)
      
      return await response.json()
    } catch (error) {
      console.warn('Could not fetch output file:', error)
      return null
    }
  }

  /**
   * Detect file type from filename
   */
  private detectFileType(filename: string): 'ocr' | 'diagram' | 'groq_enhanced' | 'extract' {
    if (filename.includes('groq')) return 'groq_enhanced'
    if (filename.includes('extract')) return 'extract'
    if (filename.includes('diagram')) return 'diagram'
    return 'ocr'
  }

  /**
   * Monitor for new Groq-enhanced files
   */
  async getLatestGroqFiles(limit: number = 5): Promise<OutputFile[]> {
    try {
      const allFiles = await this.listOutputFiles()
      return allFiles
        .filter(file => file.groq_enhanced)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
    } catch (error) {
      console.warn('Could not get latest Groq files:', error)
      return []
    }
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(): Promise<{
    total_files: number
    groq_enhanced_files: number
    success_rate: number
    recent_activity: OutputFile[]
  }> {
    try {
      const files = await this.listOutputFiles()
      const groqFiles = files.filter(f => f.groq_enhanced)
      
      return {
        total_files: files.length,
        groq_enhanced_files: groqFiles.length,
        success_rate: files.length > 0 ? (groqFiles.length / files.length) * 100 : 0,
        recent_activity: files.slice(0, 10)
      }
    } catch (error) {
      console.warn('Could not get processing stats:', error)
      return {
        total_files: 0,
        groq_enhanced_files: 0,
        success_rate: 0,
        recent_activity: []
      }
    }
  }
}

// Global instance
export const outputMonitor = new OutputMonitor()

// React hook for monitoring output files
export function useOutputFiles() {
  const [files, setFiles] = useState<OutputFile[]>([])
  const [loading, setLoading] = useState(false)

  const refreshFiles = async () => {
    setLoading(true)
    try {
      const latestFiles = await outputMonitor.getLatestGroqFiles()
      setFiles(latestFiles)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshFiles()
  }, [])

  return {
    files,
    loading,
    refreshFiles,
    getFile: outputMonitor.getOutputFile.bind(outputMonitor),
    getStats: outputMonitor.getProcessingStats.bind(outputMonitor)
  }
}
