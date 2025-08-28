import { useState } from 'react'
import { GeneratedMeeting, MeetingDetails } from '@/lib/meeting-service'

interface UseMeetingGenerationReturn {
  generateMeeting: (
    provider: 'zoom' | 'google-meet',
    details: MeetingDetails
  ) => Promise<GeneratedMeeting | null>
  isGenerating: boolean
  error: string | null
  clearError: () => void
}

export function useMeetingGeneration(): UseMeetingGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateMeeting = async (
    provider: 'zoom' | 'google-meet',
    details: MeetingDetails
  ): Promise<GeneratedMeeting | null> => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/meeting/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          ...details
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate meeting link')
      }

      if (!data.success) {
        throw new Error('Meeting generation failed')
      }

      return data.meeting
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Meeting generation error:', err)
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  const clearError = () => setError(null)

  return {
    generateMeeting,
    isGenerating,
    error,
    clearError
  }
}